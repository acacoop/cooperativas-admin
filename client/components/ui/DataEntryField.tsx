interface DataEntryFieldProps {
    fieldType: 'input' | 'select' | 'file';
    label: string;
    value?: string | number | boolean;
    onChange: (value: any) => void;
    options?: { value: string; label: string }[]; // For select types
    placeholder?: string;
    helpText?: string;
    disabled?: boolean;
    className?: string;
    required?: boolean;
    multiple?: boolean; // For file input types
    accept?: string; // For file input types
    name?: string; // Add name prop for form fields
    id?: string; // Add id prop
}

export const DataEntryField = (props: DataEntryFieldProps) => {
    // Convert value to string for HTML elements
    const stringValue = String(props.value || '');
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (props.fieldType === 'file') {
            // For file inputs, pass the entire event to the parent handler
            props.onChange(e);
            return;
        }
        
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
                        id={props.id}
                        name={props.name}
                        value={stringValue}
                        onChange={handleChange}
                        placeholder={props.placeholder}
                        disabled={props.disabled}
                        required={props.required}
                    />
                );
            case 'select':
                return (
                    <select
                        id={props.id}
                        name={props.name}
                        value={stringValue}
                        onChange={handleChange}
                        disabled={props.disabled}
                        required={props.required}
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
            case 'file':
                return (
                    <input
                        type="file"
                        id={props.id}
                        name={props.name}
                        onChange={handleChange}
                        accept={props.accept}
                        multiple={props.multiple}
                        disabled={props.disabled}
                        required={props.required}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={`data-entry-field ${props.className || ''}`}>
            <label htmlFor={props.id}>{props.label}</label>
            {renderField()}
            {props.helpText && <small className="help-text">{props.helpText}</small>}
        </div>
    );
};