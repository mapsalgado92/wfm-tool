import 'bootstrap/dist/css/bootstrap.css'
import PageLayout from '../components/layouts/PageLayout'
import '../styles/globals.css'
import DataContextProvider from '../contexts/DataContextProvider'

function MyApp({ Component, pageProps }) {
  return <DataContextProvider>
    <PageLayout>
      <Component {...pageProps} />
    </PageLayout>
  </DataContextProvider>
}

export default MyApp
