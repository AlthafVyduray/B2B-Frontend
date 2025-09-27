import React, { useState } from 'react'
import { X } from 'lucide-react';

const DeletePackage = ({toDelete, setToDelete, confirmDelete}) => {
  
  const [deleting, setDeleting] = useState(false) 
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b">
            <h3 className="text-lg font-semibold">Confirm Delete</h3>
            <button onClick={() => setToDelete(null)} className="p-1">
            <X size={20} />
            </button>
        </div>
        <div className="p-5">
            <p className="text-gray-700 mb-4">
            Are you sure you want to delete <strong>{toDelete.package_name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
            <button onClick={() => setToDelete(null)} className="px-4 py-2 rounded bg-gray-100">
                Cancel
            </button>
            <button onClick={async () => {
                setDeleting(true);
                await confirmDelete(toDelete);
                setDeleting(false)
            }} className="px-4 py-2 rounded bg-red-600 text-white"
            disabled={deleting}>
                {deleting ? "Deleting ..." : "Delete"}
            </button>
            </div>
        </div>
        </div>
    </div>
  )
}

export default DeletePackage