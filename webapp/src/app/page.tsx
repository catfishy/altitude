"use client";
import Head from "next/head";
import Image from "next/image";
import styles from "styles/page.module.css";
import useCurrentUser from "hooks/useCurrentUser";
import useCustomerTours from "hooks/useCustomerTours";

export default function Home() {
  const {user, loading: userLoading} = useCurrentUser();
  const {tours, loading: toursLoading} = useCustomerTours(user?.customer_id || null)
  
  if (userLoading || toursLoading) {
    return null;
  } else {
    console.log("Current User:", user);
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return (
    <>
      <Head>
        <title>{user.name}</title>
        <meta name="description" content={user.email || ''} />
      </Head>
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.ctas}>
            {tours?.map((tour, index) => (
              <div key={index}>
                {tour.embed_url && (
                  <iframe 
                    src={tour.embed_url} 
                    width="100%" 
                    height="400"
                    frameBorder="0"
                    allowFullScreen
                  />
                )}
              </div>
            ))}
          </div>
        </main>
        <footer className={styles.footer}>
          <a
            href="https://www.ahrpc.ca/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />
            Go home →
          </a>
        </footer>
      </div>
    </>
  );
}
