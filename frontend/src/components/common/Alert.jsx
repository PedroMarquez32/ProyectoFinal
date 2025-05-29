export const Alert = ({ type, message }) => {
  const bgColor = type === 'error' ? 'bg-red-100' : 'bg-green-100';
  const textColor = type === 'error' ? 'text-red-700' : 'text-green-700';

  return (
    <div className={`${bgColor} ${textColor} p-4 rounded-lg mb-4`}>
      {message}
    </div>
  );
}; 