import { Link } from 'react-router-dom';

export default function Success() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center border border-gray-100 shadow-sm animate-slide-up">
        
        {/* Animated Checkmark */}
        <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500 relative">
          <div className="absolute inset-0 border-4 border-green-100 rounded-full animate-ping opacity-50"></div>
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-heading font-extrabold text-3xl mb-3 text-gray-900">
          Payment Successful!
        </h1>
        
        <p className="text-gray-500 mb-8 leading-relaxed">
          Your account has been successfully upgraded. You now have full access to unlimited scans and AI-powered insights.
        </p>

        <div className="space-y-3">
          <Link 
            to="/" 
            className="block w-full bg-brand text-white font-heading font-bold py-3 rounded-xl hover:bg-brand-dark transition-colors"
          >
            Start Analyzing
          </Link>
          <Link 
            to="/history" 
            className="block w-full bg-gray-50 text-gray-600 font-heading font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}
