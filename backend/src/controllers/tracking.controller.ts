import { Request, Response } from 'express';
import { query } from '../db/pool.js';

interface TelemetryPingInput {
  salesman_user_id: number;
  latitude: number;
  longitude: number;
  speed_mps?: number;
  speed_kmh?: number;
  heading_deg?: number;
  accuracy_m?: number;
  battery_pct?: number;
  is_moving?: boolean;
  shift_id?: number | null;
  cmp_id?: number;
}

// Realistic route coordinates for Bengaluru FMCG delivery vans (keyed by Van godown slot)
interface SimRouteSpec {
  key: 'van1' | 'van2' | 'van3';
  vehicle_no: string;
  van_name: string;
  waypoints: [number, number, number, string][];
}

const VAN_ROUTE_PRESETS: Record<'van1' | 'van2' | 'van3', SimRouteSpec> = {
  van1: {
    key: 'van1',
    vehicle_no: 'KA-01-VA-1001',
    van_name: 'Van 01 (North Belt)',
    waypoints: [
      [13.0358, 77.5970, 38, 'Near Hebbal Flyover, Bellary Road'],
      [13.0412, 77.6015, 42, 'Kodigehalli Gate, Outer Ring Road'],
      [13.0480, 77.6060, 35, 'Sahakara Nagar Main Road'],
      [13.0535, 77.6110, 28, 'Approaching Fresh Mart, Yelahanka'],
      [13.0475, 77.6045, 15, 'Yelahanka Bypass Junction'],
      [13.0398, 77.5990, 0, 'Parked at Metro Supermarket Dock'],
    ],
  },
  van2: {
    key: 'van2',
    vehicle_no: 'KA-01-VA-2002',
    van_name: 'Van 02 (East Belt)',
    waypoints: [
      [12.9784, 77.6408, 31, '100 Feet Road, Indiranagar'],
      [12.9830, 77.6520, 26, 'CMH Road Crossing, Indiranagar'],
      [12.9885, 77.6650, 44, 'Old Madras Road, Near Gopalan Mall'],
      [12.9920, 77.6740, 39, 'Approaching KR Puram Bridge'],
      [12.9860, 77.6590, 20, 'Mahadevapura Ring Road'],
      [12.9810, 77.6470, 0, 'Delivery at Green Basket Wholesale'],
    ],
  },
  van3: {
    key: 'van3',
    vehicle_no: 'KA-01-VA-3003',
    van_name: 'Van 03 (South Belt)',
    waypoints: [
      [12.9352, 77.6245, 34, 'Koramangala 80 Feet Road'],
      [12.9250, 77.5938, 28, 'Jayanagar 4th Block Shopping Complex'],
      [12.9141, 77.6101, 41, 'BTM Outer Ring Junction'],
      [12.9010, 77.5960, 24, 'JP Nagar Central Avenue'],
      [12.8850, 77.6010, 18, 'Bannerghatta Main Road'],
      [12.9279, 77.5890, 0, 'Delivery at Kaveri Super Bazaar'],
    ],
  },
};

function resolveVanRoutePreset(godownName?: string | null, userId?: number | null, username?: string | null): SimRouteSpec {
  const g = (godownName || '').toLowerCase();
  const u = (username || '').toLowerCase();
  const id = Number(userId) || 0;

  if (g.includes('van 02') || g.includes('van2') || g.includes('east') || id === 6 || u.includes('vansales1') || u.includes('van2')) {
    return VAN_ROUTE_PRESETS.van2;
  }
  if (g.includes('van 03') || g.includes('van3') || g.includes('south') || id === 8 || u.includes('van3')) {
    return VAN_ROUTE_PRESETS.van3;
  }
  return VAN_ROUTE_PRESETS.van1;
}

const currentSimulationStep: Record<number, number> = {};

export class TrackingController {
  /**
   * POST /api/v1/tracking/ping
   * Records incoming mobile GPS telemetry ping into van_location_ping table
   */
  static async recordPing(req: Request, res: Response): Promise<void> {
    try {
      let {
        salesman_user_id,
        latitude,
        longitude,
        speed_mps,
        speed_kmh,
        heading_deg = 0,
        accuracy_m = 5.0,
        battery_pct = 85,
        is_moving = true,
        shift_id = null,
        cmp_id = 12,
      } = req.body as any;

      if (!salesman_user_id) {
        salesman_user_id = (req as any).user?.userId || (req as any).user?.id || req.body.userId || 7;
      }
      if (!cmp_id) {
        cmp_id = (req as any).user?.companyId || 12;
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lng)) {
        res.status(400).json({
          isValid: false,
          message: 'Missing or invalid parameters: latitude, longitude',
          errorCode: 'INVALID_INPUT',
          data: null,
        });
        return;
      }

      const calculatedMps = speed_mps !== undefined ? speed_mps : (speed_kmh ? parseFloat(speed_kmh) / 3.6 : 0);

      const insertSql = `
        INSERT INTO van_location_ping (
          cmp_id,
          salesman_user_id,
          shift_id,
          latitude,
          longitude,
          accuracy_m,
          speed_mps,
          heading_deg,
          battery_pct,
          is_moving,
          recorded_at,
          received_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        RETURNING *;
      `;

      const result = await query(insertSql, [
        cmp_id,
        salesman_user_id,
        shift_id,
        lat,
        lng,
        accuracy_m,
        calculatedMps,
        heading_deg,
        battery_pct,
        is_moving,
      ]);

      res.status(201).json({
        isValid: true,
        message: 'Telemetry ping recorded successfully',
        data: {
          ping: result.rows[0],
        },
      });
    } catch (err: any) {
      console.error('[TrackingController.recordPing Error]', err);
      res.status(500).json({
        isValid: false,
        message: err.message || 'Internal server error recording telemetry',
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    }
  }

  /**
   * GET /api/v1/tracking/live
   * Retrieves latest live location ping for all active delivery vans
   */
  static async getLiveFleet(req: Request, res: Response): Promise<void> {
    try {
      const salesmanId = req.query.salesmanId ? parseInt(req.query.salesmanId as string, 10) : null;
      let sql = `
        SELECT DISTINCT ON (p.salesman_user_id)
          p.id,
          p.cmp_id,
          p.salesman_user_id,
          p.shift_id,
          p.latitude,
          p.longitude,
          p.accuracy_m,
          p.speed_mps,
          p.heading_deg,
          p.battery_pct,
          p.is_moving,
          p.recorded_at,
          p.received_at,
          u.full_name as salesman_name,
          u.username as salesman_username,
          u.mobile as salesman_mobile,
          u.van_godown_name
        FROM van_location_ping p
        INNER JOIN users u ON u.userid = p.salesman_user_id
        WHERE u.role = 'VAN_REP'
      `;
      const params: any[] = [];
      if (salesmanId) {
        params.push(salesmanId);
        sql += ` AND p.salesman_user_id = $1`;
      }
      sql += ` ORDER BY p.salesman_user_id, p.recorded_at DESC;`;

      let result = await query(sql, params);

      // If database is empty, automatically seed initial live telemetry
      if (result.rows.length === 0 && !salesmanId) {
        await TrackingController.seedInitialTelemetry();
        result = await query(sql);
      }

      // Format response with speed in km/h, status label, and deduplicate by vehicle registration
      const seenVehicles = new Set<string>();
      const vans: any[] = [];

      for (const row of result.rows) {
        const speedKmh = Math.round((parseFloat(row.speed_mps) || 0) * 3.6);
        const heading = parseFloat(row.heading_deg) || 0;
        const lat = parseFloat(row.latitude);
        const lng = parseFloat(row.longitude);

        let status = 'on_field';
        if (speedKmh === 0) {
          status = 'stopped';
        } else if (speedKmh > 0) {
          status = 'moving';
        }

        const simInfo = resolveVanRoutePreset(row.van_godown_name, row.salesman_user_id, row.salesman_username);

        if (seenVehicles.has(simInfo.vehicle_no)) {
          continue;
        }
        seenVehicles.add(simInfo.vehicle_no);

        vans.push({
          id: `veh_${row.salesman_user_id}`,
          salesman_user_id: Number(row.salesman_user_id),
          salesman_name: row.salesman_name || 'Van Driver',
          salesman_mobile: row.salesman_mobile || '+91 98860 11223',
          vehicle_reg_no: simInfo.vehicle_no,
          van_name: simInfo.van_name,
          godown_name: row.van_godown_name || simInfo.van_name,
          latitude: lat,
          longitude: lng,
          speed_kmh: speedKmh,
          heading_deg: heading,
          battery_pct: row.battery_pct || 85,
          accuracy_m: parseFloat(row.accuracy_m) || 5.0,
          is_moving: row.is_moving,
          status,
          recorded_at: row.recorded_at,
          received_at: row.received_at,
        });
      }

      res.status(200).json({
        isValid: true,
        message: 'Live fleet telemetry retrieved',
        data: {
          total_active_vans: vans.length,
          vans,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[TrackingController.getLiveFleet Error]', err);
      res.status(500).json({
        isValid: false,
        message: err.message || 'Internal server error retrieving fleet',
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    }
  }

  /**
   * GET /api/v1/tracking/history/:userId
   * Retrieves historical breadcrumb trail for today's delivery shift
   */
  static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        res.status(400).json({ isValid: false, message: 'Invalid userId parameter' });
        return;
      }

      const sql = `
        SELECT
          id,
          latitude,
          longitude,
          speed_mps,
          heading_deg,
          battery_pct,
          recorded_at
        FROM van_location_ping
        WHERE salesman_user_id = $1
          AND recorded_at >= CURRENT_DATE
        ORDER BY recorded_at ASC
        LIMIT 200;
      `;

      const result = await query(sql, [userId]);

      const trail = result.rows.map(r => ({
        lat: parseFloat(r.latitude),
        lng: parseFloat(r.longitude),
        speed_kmh: Math.round((parseFloat(r.speed_mps) || 0) * 3.6),
        heading: parseFloat(r.heading_deg) || 0,
        battery: r.battery_pct,
        time: r.recorded_at,
      }));

      res.status(200).json({
        isValid: true,
        message: 'Vehicle history trail retrieved',
        data: {
          salesman_user_id: userId,
          count: trail.length,
          trail,
        },
      });
    } catch (err: any) {
      console.error('[TrackingController.getHistory Error]', err);
      res.status(500).json({
        isValid: false,
        message: err.message || 'Failed to fetch tracking history',
        data: null,
      });
    }
  }

  /**
   * POST /api/v1/tracking/simulate-step
   * Progresses the van to next route coordinate point & records ping
   */
  static async simulateStep(req: Request, res: Response): Promise<void> {
    try {
      let salesmanId = req.body.salesman_user_id ? parseInt(req.body.salesman_user_id, 10) : 0;
      let godownName: string | null = null;

      if (salesmanId > 0) {
        const uRes = await query(`SELECT userid, van_godown_name FROM users WHERE userid = $1`, [salesmanId]);
        if (uRes.rows.length > 0) {
          godownName = uRes.rows[0].van_godown_name;
        } else {
          salesmanId = 0;
        }
      }

      if (salesmanId === 0) {
        const fallbackRes = await query(
          `SELECT userid, van_godown_name FROM users WHERE role = 'VAN_REP' ORDER BY userid ASC LIMIT 1`
        );
        if (fallbackRes.rows.length === 0) {
          res.status(404).json({ isValid: false, message: 'No active VAN_REP drivers found', data: null });
          return;
        }
        salesmanId = Number(fallbackRes.rows[0].userid);
        godownName = fallbackRes.rows[0].van_godown_name;
      }

      const sim = resolveVanRoutePreset(godownName);
      const currentIdx = currentSimulationStep[salesmanId] || 0;
      const nextIdx = (currentIdx + 1) % sim.waypoints.length;
      currentSimulationStep[salesmanId] = nextIdx;

      const [lat, lng, speedKmh, address] = sim.waypoints[nextIdx];
      const heading = (nextIdx * 55) % 360;

      const insertSql = `
        INSERT INTO van_location_ping (
          cmp_id,
          salesman_user_id,
          shift_id,
          latitude,
          longitude,
          accuracy_m,
          speed_mps,
          heading_deg,
          battery_pct,
          is_moving,
          recorded_at,
          received_at
        ) VALUES (12, $1, NULL, $2, $3, 4.2, $4, $5, 90, $6, NOW(), NOW())
        RETURNING *;
      `;

      const result = await query(insertSql, [
        salesmanId,
        lat,
        lng,
        speedKmh / 3.6,
        heading,
        speedKmh > 0,
      ]);

      res.status(200).json({
        isValid: true,
        message: `Van step simulated: ${address}`,
        data: {
          current_step: nextIdx,
          total_steps: sim.waypoints.length,
          ping: result.rows[0],
          address,
        },
      });
    } catch (err: any) {
      console.error('[TrackingController.simulateStep Error]', err);
      res.status(500).json({
        isValid: false,
        message: err.message || 'Failed to simulate tracking step',
        data: null,
      });
    }
  }

  /**
   * Helper to seed realistic initial pings if database is clean
   */
  private static async seedInitialTelemetry(): Promise<void> {
    try {
      const repsRes = await query(
        `SELECT userid, van_godown_name FROM users WHERE role = 'VAN_REP' ORDER BY userid ASC`
      );
      if (repsRes.rows.length === 0) return;

      console.log('[Tracking] Seeding initial van location pings into PostgreSQL...');
      for (const rep of repsRes.rows) {
        const userId = Number(rep.userid);
        const route = resolveVanRoutePreset(rep.van_godown_name);
        for (let i = 0; i < route.waypoints.length; i++) {
          const [lat, lng, speedKmh] = route.waypoints[i];
          const heading = (i * 60) % 360;
          await query(
            `INSERT INTO van_location_ping (
              cmp_id, salesman_user_id, shift_id, latitude, longitude,
              accuracy_m, speed_mps, heading_deg, battery_pct, is_moving,
              recorded_at, received_at
            ) VALUES (12, $1, NULL, $2, $3, 3.5, $4, $5, 90, $6, NOW() - INTERVAL '${(route.waypoints.length - i) * 3} minutes', NOW())`,
            [userId, lat, lng, speedKmh / 3.6, heading, speedKmh > 0]
          );
        }
      }
      console.log('[Tracking] Successfully seeded initial location pings');
    } catch (e) {
      console.error('[Tracking] Error seeding telemetry:', e);
    }
  }
}
