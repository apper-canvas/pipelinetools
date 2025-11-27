import CompaniesList from '@/components/organisms/CompaniesList'

function Company() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Company Management</h1>
        <p className="text-slate-600 mt-1">Manage your business relationships and company information</p>
      </div>
      
      <CompaniesList />
    </div>
  )
}

export default Company