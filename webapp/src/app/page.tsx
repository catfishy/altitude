"use client";
import Head from "next/head";
import Image from "next/image";
import styles from "styles/page.module.css";
import useCurrentUser from "hooks/useCurrentUser";

export default function Home() {
  const currentUser = useCurrentUser();

  if (currentUser.loading) {
    return null;
  }

  if (!currentUser.user) {
    window.location.href = "/login";
    return null;
  }

  return (
    <>
      <Head>
        <title>{currentUser.user.displayName}</title>
        <meta name="description" content={currentUser.user.email || ''} />
      </Head>
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.ctas}>
            Customer Content
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
