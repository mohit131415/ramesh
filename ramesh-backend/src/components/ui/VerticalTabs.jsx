"use client"
import PropTypes from "prop-types"

const VerticalTabs = ({ tabs, activeTab, onTabChange, children }) => {
  const handleTabClick = (tabId) => {
    onTabChange(tabId)
  }

  return (
    <div className="flex flex-col md:flex-row w-full">
      {/* Tabs sidebar */}
      <div className="w-full md:w-64 border-r border-gray-200">
        <ul className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
          {tabs.map((tab) => (
            <li key={tab.id} className="w-full">
              <button
                onClick={() => handleTabClick(tab.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                  activeTab === tab.id
                    ? "border-l-4 border-l-ramesh-gold bg-gray-50 font-medium"
                    : "border-l-4 border-l-transparent"
                }`}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tab content */}
      <div className="flex-1 p-4 md:p-6">{children}</div>
    </div>
  )
}

VerticalTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
}

export default VerticalTabs
