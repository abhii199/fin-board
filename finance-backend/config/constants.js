module.exports = {
  ROLES: {
    VIEWER: 'viewer',
    ANALYST: 'analyst',
    ADMIN: 'admin'
  },
  PERMISSIONS: {
    READ_RECORDS: 'read_records',
    CREATE_RECORDS: 'create_records',
    UPDATE_RECORDS: 'update_records',
    DELETE_RECORDS: 'delete_records',
    READ_SUMMARY: 'read_summary',
    MANAGE_USERS: 'manage_users'
  },
  RECORD_TYPES: {
    INCOME: 'income',
    EXPENSE: 'expense'
  },
  ROLE_PERMISSIONS: {
    viewer: ['read_records', 'read_summary'],
    analyst: ['read_records', 'read_summary'],
    admin: [
      'read_records',
      'create_records',
      'update_records',
      'delete_records',
      'read_summary',
      'manage_users'
    ]
  }
};
