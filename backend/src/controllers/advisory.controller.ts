import { Request, Response } from 'express';
import { query } from '../db/pool.js';

export class AdvisoryController {
  static async getAdvisories(req: Request, res: Response) {
    try {
      const result = await query('SELECT * FROM public.crop_advisories ORDER BY created_at DESC');
      res.status(200).json({ isValid: true, message: 'Advisories retrieved', data: result.rows });
    } catch (err: any) {
      console.error('[AdvisoryController.getAdvisories]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async createAdvisory(req: Request, res: Response) {
    try {
      const { farmerName, mobileNumber = '', cropName, issueDescription, district = '' } = req.body;
      if (!farmerName || !cropName || !issueDescription) {
        return res.status(400).json({ isValid: false, message: 'farmerName, cropName, and issueDescription are required', data: null });
      }

      const sql = `
        INSERT INTO public.crop_advisories (farmer_name, mobile_number, crop_name, issue_description, district, status)
        VALUES ($1, $2, $3, $4, $5, 'In Review')
        RETURNING *
      `;
      const result = await query(sql, [farmerName, mobileNumber, cropName, issueDescription, district]);
      res.status(201).json({ isValid: true, message: 'Advisory ticket created', data: result.rows[0] });
    } catch (err: any) {
      console.error('[AdvisoryController.createAdvisory]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async updateAdvisory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, solutionNotes } = req.body;

      const sql = `
        UPDATE public.crop_advisories
        SET 
          status = COALESCE($1, status),
          solution_notes = COALESCE($2, solution_notes),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;
      const result = await query(sql, [status, solutionNotes, id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ isValid: false, message: 'Advisory ticket not found', data: null });
      }
      res.status(200).json({ isValid: true, message: 'Advisory ticket updated', data: result.rows[0] });
    } catch (err: any) {
      console.error('[AdvisoryController.updateAdvisory]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }

  static async deleteAdvisory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await query('DELETE FROM public.crop_advisories WHERE id = $1 RETURNING *', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ isValid: false, message: 'Advisory ticket not found', data: null });
      }
      res.status(200).json({ isValid: true, message: 'Advisory ticket deleted', data: result.rows[0] });
    } catch (err: any) {
      console.error('[AdvisoryController.deleteAdvisory]', err);
      res.status(500).json({ isValid: false, message: err.message, data: null });
    }
  }
}
