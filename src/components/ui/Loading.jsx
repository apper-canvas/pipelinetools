const Loading = ({ type = "default", className = "" }) => {
  if (type === "pipeline") {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map((stage) => (
            <div key={stage} className="flex-shrink-0 w-80">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 w-24 shimmer rounded"></div>
                  <div className="h-6 w-8 shimmer rounded-full"></div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((card) => (
                    <div key={card} className="p-4 border border-slate-200 rounded-lg space-y-3">
                      <div className="h-5 w-3/4 shimmer rounded"></div>
                      <div className="h-4 w-1/2 shimmer rounded"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-4 w-16 shimmer rounded"></div>
                        <div className="h-4 w-20 shimmer rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === "table") {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden ${className}`}>
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div className="h-6 w-32 shimmer rounded"></div>
            <div className="h-10 w-64 shimmer rounded"></div>
          </div>
        </div>
        <div className="divide-y divide-slate-200">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
            <div key={row} className="px-6 py-4 flex items-center space-x-4">
              <div className="h-5 w-1/4 shimmer rounded"></div>
              <div className="h-5 w-1/5 shimmer rounded"></div>
              <div className="h-5 w-1/6 shimmer rounded"></div>
              <div className="h-5 w-1/6 shimmer rounded"></div>
              <div className="h-6 w-16 shimmer rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === "cards") {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((card) => (
          <div key={card} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2 flex-1">
                <div className="h-5 w-3/4 shimmer rounded"></div>
                <div className="h-4 w-1/2 shimmer rounded"></div>
              </div>
              <div className="h-8 w-16 shimmer rounded-full"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full shimmer rounded"></div>
              <div className="h-4 w-2/3 shimmer rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 ${className}`}>
      <div className="text-center space-y-4">
        <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-slate-600 font-medium">Loading...</p>
      </div>
    </div>
  )
}

export default Loading