import { sql, getConnection } from '../config/sqlDb';

const createTables = async () => {
  const pool = await getConnection();
  
  try {
    // Create Devices table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Devices' AND xtype='U')
      CREATE TABLE Devices (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        type NVARCHAR(100) NOT NULL,
        serialNumber NVARCHAR(255) UNIQUE NOT NULL,
        status NVARCHAR(50) NOT NULL CHECK (status IN ('available', 'in-use', 'maintenance', 'retired')),
        assignedTo NVARCHAR(255),
        location NVARCHAR(255) NOT NULL,
        purchaseDate DATE,
        warrantyExpiry DATE,
        notes NVARCHAR(MAX),
        createdAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
      )
    `);
    
    console.log('Database tables created successfully');
  } catch (err) {
    console.error('Error creating database tables:', err);
  } finally {
    await pool.close();
    process.exit(0);
  }
};

// Run the setup
createTables().catch(console.error);
