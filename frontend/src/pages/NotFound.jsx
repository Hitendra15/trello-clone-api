import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { EmptyState } from '../components/ui/State'
import { useTitle } from '../lib/useTitle'

export default function NotFound() {
  useTitle('Page not found')
  return (
    <div className="page">
      <EmptyState icon={Compass} title="That page doesn't exist"
        action={<Link className="btn btn-primary" to="/">Go to dashboard</Link>}>
        The link may be out of date, or the page may have moved.
      </EmptyState>
    </div>
  )
}
