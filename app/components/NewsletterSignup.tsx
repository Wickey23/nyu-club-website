"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

const dismissedKey = "viva-peru-newsletter-dismissed";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(dismissedKey)) return;
    const timer = window.setTimeout(() => setOpen(true), 12000);
    return () => window.clearTimeout(timer);
  }, []);

  async function subscribe(event: FormEvent, source: string) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.rpc("subscribe_newsletter", {
      p_email: email.trim(),
      p_name: name.trim(),
      p_source: source,
    });
    setLoading(false);
    if (error) return setMessage(error.message || "Unable to subscribe right now.");
    setMessage("You’re on the list. Watch your inbox for ¡Viva Perú! updates.");
    setEmail("");
    setName("");
    window.localStorage.setItem(dismissedKey, "subscribed");
    window.setTimeout(() => setOpen(false), 1800);
  }

  function dismiss() {
    window.localStorage.setItem(dismissedKey, "dismissed");
    setOpen(false);
  }

  function Form({source}:{source:string}) {
    return <form className="newsletter-form" onSubmit={(event)=>subscribe(event,source)}>
      <div className="newsletter-fields">
        <input aria-label="Name" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name (optional)" />
        <input aria-label="Email address" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@nyu.edu" />
      </div>
      <button disabled={loading} type="submit">{loading?"Joining…":"Join the newsletter"}</button>
      {message && <small className="newsletter-message">{message}</small>}
      <small className="newsletter-note">Club news, event announcements and cultural programming. Unsubscribe anytime.</small>
    </form>;
  }

  return <>
    <section className="newsletter-section">
      <div className="wrap newsletter-grid">
        <div className="newsletter-copy">
          <span className="kicker">Stay connected</span>
          <h2>Peru in your inbox.</h2>
          <p>Get upcoming events, collaborations, cultural programming and community updates from the NYU Peruvian Student Association.</p>
        </div>
        <div className="newsletter-card"><Form source="homepage-inline" /></div>
      </div>
    </section>

    {open && <div className="newsletter-popup-wrap" role="dialog" aria-modal="true" aria-label="Join the ¡Viva Perú! newsletter">
      <section className="newsletter-popup">
        <button className="newsletter-close" onClick={dismiss} aria-label="Dismiss newsletter signup">×</button>
        <span className="kicker">¡Viva Perú! updates</span>
        <h2>Don’t miss what’s next.</h2>
        <p>Join the club newsletter for event announcements and community updates.</p>
        <Form source="homepage-popup" />
      </section>
    </div>}
  </>;
}
