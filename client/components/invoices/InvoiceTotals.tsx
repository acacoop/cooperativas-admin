import { Card } from '../ui';
import { Invoice } from '@/types';

interface InvoiceDetailsProps {
  invoice: Invoice;
}

export function InvoiceTotals({ invoice }: InvoiceDetailsProps) {
    return (
        <Card title="💰 Resumen de Totales">
            <div className="bg-gray-50 p-6 rounded-lg">
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">${invoice.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">IVA:</span>
                        <span className="font-semibold">${invoice.iva_amount.toLocaleString()}</span>
                    </div>
                    <hr className="border-gray-300" />
                    <div className="flex justify-between text-lg">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="font-bold text-green-600">
                          ${invoice.total_amount.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    )
}