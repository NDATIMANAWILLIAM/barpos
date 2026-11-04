export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-gray-300 text-brass-600 shadow-sm focus:ring-brass-500 ' +
                className
            }
        />
    );
}
