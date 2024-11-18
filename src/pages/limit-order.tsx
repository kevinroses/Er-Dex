import dynamic from 'next/dynamic'

const LimitOrder = dynamic(() => import('@/features/LimitOrder'))

function LimitOrderPage() {
  return (
    <div>
      <LimitOrder />
    </div>
  )
}
export default LimitOrderPage

export async function getStaticProps() {
  return {
    props: { title: 'Limit Order' }
  }
}
