
import express from 'express';
import Design from '../models/Design.ts';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// Middleware to verify JWT and get user ID
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
};

// Save or Update Design
router.post('/save', authenticate, async (req: any, res: any) => {
  try {
    const { roomData, furniture } = req.body;
    
    if (!roomData || !roomData.measurements) {
      return res.status(400).json({ message: 'Missing room data' });
    }

    const design = await Design.findOneAndUpdate(
      { userId: req.userId },
      { 
        roomData, 
        furniture, 
        updatedAt: Date.now() 
      },
      { upsert: true, new: true }
    );
    
    console.log(`✅ DATABASE: Design saved/updated for User ${req.userId}. Items synced: ${furniture.length}`);
    res.json(design);
  } catch (error) {
    console.error('❌ DATABASE SAVE ERROR:', error);
    res.status(500).json({ message: 'Database save failed' });
  }
});

// Load Design
router.get('/load', authenticate, async (req: any, res: any) => {
  try {
    const design = await Design.findOne({ userId: req.userId });
    if (!design) {
      console.log(`ℹ️ INFO: No existing design found for User ${req.userId}`);
      return res.status(404).json({ message: 'No existing design found' });
    }
    res.json(design);
  } catch (error) {
    console.error('❌ DATABASE LOAD ERROR:', error);
    res.status(500).json({ message: 'Failed to load design' });
  }
});

export default router;
