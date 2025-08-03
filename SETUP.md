# 🚀 Quick Setup Guide

## Prerequisites
- Python 3.8+ 
- Node.js 16+
- npm or yarn

## One-Command Setup

### Option 1: Start Everything at Once
```bash
./start_app.sh
```

### Option 2: Start Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
./start_backend.sh
```

**Terminal 2 - Frontend:**
```bash
./start_frontend.sh
```

## Manual Setup (if scripts don't work)

### Backend Setup
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
cd backend
python app.py
```

### Frontend Setup
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Test the Backend

Once the backend is running, you can test it:
```bash
python test_backend.py
```

## Features to Try

1. **Select a Country**: Choose from 10 supported countries
2. **Fill Property Details**: Dynamic form based on country selection
3. **Get Predictions**: AI-powered price estimates in local currency
4. **View Conversions**: See prices in multiple global currencies
5. **Check History**: View your previous predictions

## Troubleshooting

### Backend Issues
- Ensure Python 3.8+ is installed
- Check if all dependencies are installed: `pip list`
- Verify the server is running on port 5000

### Frontend Issues
- Ensure Node.js 16+ is installed
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Port Conflicts
- Backend: Change port in `backend/app.py` line 280
- Frontend: Change port in `frontend/package.json` proxy setting

## Support

If you encounter issues, check the main README.md for detailed documentation. 