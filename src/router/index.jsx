import { createBrowserRouter } from "react-router-dom"
import { Suspense, lazy } from "react"
import Layout from "@/components/organisms/Layout"

// Lazy load all page components
const Pipeline = lazy(() => import("@/components/pages/Pipeline"))
const Contacts = lazy(() => import("@/components/pages/Contacts"))
const Company = lazy(() => import("@/components/pages/Company"))
const Activities = lazy(() => import("@/components/pages/Activities"))
const Analytics = lazy(() => import("@/components/pages/Analytics"))
const Reports = lazy(() => import("@/components/pages/Reports"))
const Quotes = lazy(() => import("@/components/pages/Quotes"))
const SalesOrders = lazy(() => import("@/components/pages/SalesOrders"))
const Customize = lazy(() => import("@/components/pages/Customize"))
const Settings = lazy(() => import("@/components/pages/Settings"))
const NotFound = lazy(() => import("@/components/pages/NotFound"))
// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="text-slate-600 font-medium">Loading...</p>
    </div>
  </div>
)

// Main routes configuration
const mainRoutes = [
  {
    path: "",
    index: true,
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Pipeline />
      </Suspense>
    )
  },
  {
    path: "contacts",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Contacts />
      </Suspense>
    )
  },
  {
    path: "activities",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Activities />
      </Suspense>
    )
  },
  {
    path: "analytics",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Analytics />
      </Suspense>
)
  },
  {
    path: "reports",
    element: (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>}>
        <Reports />
      </Suspense>
    )
  },
{
  path: "sales-orders",
  element: (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-4">
        <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    </div>}>
      <SalesOrders />
    </Suspense>
  )
},
  {
    path: "quotes",
    element: <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-4">
        <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    </div>}><Quotes /></Suspense>,
  },
  {
    path: "company",
    element: (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>}>
        <Company />
      </Suspense>
    )
  },
{
    path: "customize",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Customize />
      </Suspense>
    )
},
  {
    path: "settings",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Settings />
      </Suspense>
    )
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFound />
      </Suspense>
    )
  }
]

// Router configuration
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [...mainRoutes]
  }
]

export const router = createBrowserRouter(routes)