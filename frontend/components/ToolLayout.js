import Head from 'next/head';
import { memo, useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Chat from './Chat';
import { getAdminConfig, getSeo, trackUsage } from '../lib/api';
import { useAuth } from '../lib/authContext';

const ToolLayout = memo(function ToolLayout({ tool, title, description, keywords, children }) {
  const { isAdmin } = useAuth();
  const [announcement, setAnnouncement] = useState('');
  const [seo, setSeo] = useState({ title:'', description:'', keywords:'' });

  useEffect(() => {
    getAdminConfig().then(res => {
      if (res.data?.announcementActive && res.data?.announcement) setAnnouncement(res.data.announcement);
    }).catch(()=>{});

    if (tool) {
      getSeo(tool).then(res => setSeo(res.data)).catch(()=>{});
      trackUsage({ tool, action:'view' });
    }
  }, [tool]);

  const pageTitle = seo.title || (title ? `${title} - MasterhubPDF` : 'MasterhubPDF - Free PDF & Image Tools');
  const pageDesc = seo.description || description || 'Free online PDF and image tools — merge, split, compress, convert instantly.';
  const pageKeys = seo.keywords || keywords || '';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        {pageKeys && <meta name="keywords" content={pageKeys} />}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </Head>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar announcement={announcement} />
        <main className="flex-1">{children}</main>
        <Footer />
        <Chat />
      </div>
    </>
  );
});

export default ToolLayout;
