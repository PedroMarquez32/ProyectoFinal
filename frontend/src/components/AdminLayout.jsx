import React from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="ml-64 flex-1 p-8">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;