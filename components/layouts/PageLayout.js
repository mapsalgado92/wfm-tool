import Header from "./Header"
import Head from "next/dist/next-server/lib/head"


const PageLayout = (props) => {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400&family=Ubuntu:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <Header />
      {props.children}
      <footer className="footer text-center mt-auto border-top container p-4">
        An app by <span className="text-danger">Mario Salgado</span>
      </footer>
    </>
  )
}

export default PageLayout
