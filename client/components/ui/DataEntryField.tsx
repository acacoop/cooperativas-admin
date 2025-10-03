interface DataEntryFieldProps {
    fieldType: 'input' | 'select';
    label: string;
    value: string | number | boolean;
    onChange: (value: any) => void;
    options?: { value: string; label: string }[]; // For select types
    placeholder?: string;
    helpText?: string;
    disabled?: boolean;
    className?: string;
    required?: boolean;
}

export const DataEntryField = (props: DataEntryFieldProps) => {
    // Convert value to string for HTML elements
    const stringValue = String(props.value);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const newValue = e.target.value;
        
        // Convert back to appropriate type based on original value type
        if (typeof props.value === 'number') {
            props.onChange(Number(newValue) || 0);
        } else if (typeof props.value === 'boolean') {
            props.onChange(newValue === 'true');
        } else {
            props.onChange(newValue);
        }
    };

    const renderField = () => {
        switch (props.fieldType) {
            case 'input':
                return (
                    <input
                        type="text"
                        value={stringValue}
                        onChange={handleChange}
                        placeholder={props.placeholder}
                        disabled={props.disabled}
                    />
                );
            case 'select':
                return (
                    <select
                        value={stringValue}
                        onChange={handleChange}
                        disabled={props.disabled}
                    >
                        {props.placeholder && (
                            <option value="" disabled>
                                {props.placeholder}
                            </option>
                        )}
                        {props.options?.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`data-entry-field ${props.className || ''}`}>
            <label>{props.label}</label>
            {renderField()}
            {props.helpText && <small className="help-text">{props.helpText}</small>}
        </div>
    );
};