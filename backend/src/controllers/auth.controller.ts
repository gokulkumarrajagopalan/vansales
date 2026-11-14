import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';
import { JWT_SECRET } from '../middleware/auth.middleware.js';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({
          isValid: false,
          message: 'Username and password are required',
          errorCode: 'INVALID_INPUT',
          data: null,
        });
      }

      const userRes = await query(
        `SELECT userid, username, password, full_name, email, role, van_godown_name, mobile, isactive
         FROM users
         WHERE LOWER(username) = LOWER($1) 
            OR LOWER(email) = LOWER($1)
            OR (LOWER($1) IN ('admin', 'admin1') AND LOWER(username) IN ('admin', 'admin1'))
            OR (LOWER($1) IN ('admin@talliffy.com', 'admin1@talliffy.com') AND (LOWER(username) = 'admin' OR LOWER(email) = 'admin@talliffy.com'))
         ORDER BY userid ASC LIMIT 1`,
        [username.trim()]
      );

      if (userRes.rows.length === 0) {
        return res.status(401).json({
          isValid: false,
          message: 'Invalid username or password',
          errorCode: 'AUTH_FAILED',
          data: null,
        });
      }

      const user = userRes.rows[0];
      let isMatch = false;

      // Verify bcrypt hash; only allow legacy plaintext match in non-production development
      if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
        isMatch = await bcrypt.compare(password, user.password);
      } else if (process.env.NODE_ENV !== 'production') {
        isMatch = user.password === password;
      }

      if (!isMatch) {
        return res.status(401).json({
          isValid: false,
          message: 'Invalid username or password',
          errorCode: 'AUTH_FAILED',
          data: null,
        });
      }

      const companyId = parseInt(process.env.DEFAULT_COMPANY_ID || '12', 10);
      const companyCode = process.env.DEFAULT_COMPANY_CODE || '30449';

      const cmpRes = await query(
        `SELECT cmpid, name, code, currency_symbol, currency_formal_name, country
         FROM public.companies
         WHERE cmpid = $1
         LIMIT 1`,
        [companyId]
      );
      const companyRow = cmpRes.rows[0];
      const currencySymbol = companyRow?.currency_symbol || 'AED';
      const currencyCode = companyRow?.currency_formal_name || 'AED';

      const userRole = (user.role || 'VAN_REP').toUpperCase();
      const defaultGodown =
        user.van_godown_name ||
        (userRole === 'ADMIN'
          ? 'Headquarters'
          : userRole === 'ACCOUNTANT'
          ? 'Accounts Office'
          : userRole === 'WAREHOUSE' || userRole === 'WAREHOUSE_MANAGER'
          ? 'Central Warehouse'
          : 'Van 01 Godown');

      const tokenPayload = {
        userId: user.userid,
        username: user.username,
        fullName: user.full_name,
        role: userRole,
        companyId,
        companyCode,
        companyName: companyRow?.name || 'Talliffy Demo Company',
        currency: currencyCode,
        currencySymbol,
        godownName: defaultGodown,
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

      return res.status(200).json({
        isValid: true,
        success: true,
        message: 'Login successful',
        errorCode: null,
        token,
        deviceToken: '',
        userId: Number(user.userid),
        loginId: user.username,
        username: user.username,
        fullName: user.full_name,
        role: userRole,
        licenceNo: user.licence_no ? String(user.licence_no) : '',
        mobile: user.mobile,
        companyId,
        companyCode,
        companyName: companyRow?.name || 'Talliffy Demo Company',
        currency: currencyCode,
        currencySymbol,
        data: {
          token,
          deviceToken: '',
          userId: Number(user.userid),
          loginId: user.username,
          username: user.username,
          fullName: user.full_name,
          role: userRole,
          mobile: user.mobile,
          licenceNo: user.licence_no ? String(user.licence_no) : '',
          currency: currencyCode,
          currencySymbol,
          companyName: companyRow?.name || 'Talliffy Demo Company',
          user: {
            id: user.userid,
            username: user.username,
            fullName: user.full_name,
            email: user.email,
            role: userRole,
            mobile: user.mobile,
            godownName: defaultGodown,
            companyId,
            companyCode,
            currency: currencyCode,
            currencySymbol,
          },
        },
      });
    } catch (err: any) {
      console.error('[Login Error]', err);
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    }
  }

  static async me(req: Request, res: Response) {
    return res.status(200).json({
      isValid: true,
      message: 'Profile retrieved',
      errorCode: null,
      data: req.user,
    });
  }
}
