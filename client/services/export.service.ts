

export const exportService = {

    async exportInvoicesCSV(cooperativeId: number): Promise<Blob> {
        if (!cooperativeId) {
            throw new Error('Cooperative ID is required');
        }
        
        const token = localStorage.getItem('token');
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        const response = await fetch(`${baseURL}/invoices/export/csv`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to export CSV: ${response.statusText}`);
        }

        return await response.blob();
    },

    async exportInvoicesJSON(cooperativeId: number): Promise<any[]> {
        if (!cooperativeId) {
            throw new Error('Cooperative ID is required');
        }
        
        const token = localStorage.getItem('token');
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        const response = await fetch(`${baseURL}/invoices/cooperative`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch invoices: ${response.statusText}`);
        }

        const allInvoices = await response.json();
        
        // Filter for "aceptada" status only
        const acceptedInvoices = allInvoices.filter((invoice: any) => invoice.status === 'aceptada');
        
        return acceptedInvoices;
    }

};