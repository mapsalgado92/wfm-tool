import 'bootstrap/dist/css/bootstrap.css'
import PageLayout from '../components/layouts/PageLayout'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return <PageLayout>
    <Component {...pageProps} />
  </PageLayout>
}

export default MyApp
