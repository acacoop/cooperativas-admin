interface DataEntryCardProps {
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
    classname?: string;
    gridCols?: 'auto' | '1' | '2' | '3' | '4';
    // Add other props as needed
}


export const DataEntryCard = ({ 
    title, 
    subtitle, 
    children, 
    classname,
    gridCols = '2' 
}: DataEntryCardProps) => {
    const getGridClasses = () => {
        switch (gridCols) {
            case '1':
                return 'grid grid-cols-1 gap-4';
            case '2':
                return 'grid grid-cols-1 md:grid-cols-2 gap-4';
            case '3':
                return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
            case '4':
                return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4';
            case 'auto':
                return 'space-y-4';
            default:
                return 'grid grid-cols-1 md:grid-cols-2 gap-4';
        }
    };

    return (
        <div className={`${classname}`}>
            <h3 className="mb-4">{title}</h3>
            {subtitle && <h4 className="mb-4">{subtitle}</h4>}
            <div className={getGridClasses()}>
                {children}
            </div>
        </div>
    );
};