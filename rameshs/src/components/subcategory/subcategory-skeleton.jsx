export default function SubcategorySkeleton({ count = 3 }) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(count)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 animate-pulse"
            >
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                <div className="h-px bg-gray-100 w-full mb-3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded-full w-4"></div>
                </div>
              </div>
            </div>
          ))}
      </div>
    )
  }
  