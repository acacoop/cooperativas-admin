import { InvoiceItem } from '@/types';
import { Card } from '../ui';

interface InvoiceItemDetailsProps {
  items: InvoiceItem[];
}

export function InvoiceItemDetails({ items }: InvoiceItemDetailsProps) {
  return (
    <Card title="🛒 Items de la Factura">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-3 text-sm font-medium text-gray-600">Descripción</th>
              <th className="text-right p-3 text-sm font-medium text-gray-600">Cantidad</th>
              <th className="text-right p-3 text-sm font-medium text-gray-600">Precio Unit.</th>
              <th className="text-right p-3 text-sm font-medium text-gray-600">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="p-3 text-gray-900">{item.description}</td>
                <td className="p-3 text-right text-gray-900">{item.quantity}</td>
                <td className="p-3 text-right text-gray-900">
                  ${item.unit_price.toLocaleString()}
                </td>
                <td className="p-3 text-right font-semibold text-gray-900">
                  ${item.total_price.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
