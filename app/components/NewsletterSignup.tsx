"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

const dismissedKey = "viva-peru-newsletter-dismissed";

type NewsletterFormProps = {
  source: string;
  name: string;
  email: string;
  message: string;
  loading: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>, source: string) => void;
};

function NewsletterForm({
  source,
  name,
  email,
  message,
  loading,
  onNameChange,
  onEmailChange,
  onSubmit,
}: NewsletterFormProps) {
  return <form className="newsletter-form" onSubmit={(event)=>onSubmit(event,source)}>
    <div className="newsletter-fields">
      <input
        aria-label="Name"
        name="name"
        autoComplete="name"
        value={name}
        onChange={(e)=>onNameChange(e.target.value)}
        placeholder="Name (optional)"
      />
      <input
        aria-label="Email address"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        value={email}
        onChange={(e)=>onEmailChange(e.target.value)}
        placeholder="you@nyu.edu"
      />
    </div>
    <button disabled={loading} type="submit">{loading?"Joining…":"Join the newsletter"}</button>
    {message && <small className="newsletter-message" role="status">{message}</small>}
    <small className="newsletter-note">Club news, event announcements and cultural programming. Unsubscribe anytime.</small>
  </form>;
}

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [shortName, setShortName] = useState("NYU Perú");
  const [clubName, setClubName] = useState("NYU Peruvian Student Association");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    void supabase
      .from("site_settings")
      .select("short_name,club_name")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data?.short_name) setShortName(data.short_name);
        if (data?.club_name) setClubName(data.club_name);
      });
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem(dismissedKey)) return;
    const timer = window.setTimeout(() => setOpen(true), 12000);
    return () => window.clearTimeout(timer);
  }, []);

  async function subscribe(event: FormEvent<HTMLFormElement>, source: string) {
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
    setMessage(`You’re on the list. Watch your inbox for ${shortName} updates.`);
    setEmail("");
    setName("");
    window.localStorage.setItem(dismissedKey, "subscribed");
    window.setTimeout(() => setOpen(false), 1800);
  }

  function dismiss() {
    window.localStorage.setItem(dismissedKey, "dismissed");
    setOpen(false);
  }

  const formProps = {
    name,
    email,
    message,
    loading,
    onNameChange: setName,
    onEmailChange: setEmail,
    onSubmit: subscribe,
  };

  return <>
    <section className="newsletter-section">
      <div className="wrap newsletter-grid">
        <div className="newsletter-copy">
          <span className="kicker">Stay connected</span>
          <h2>Peru in your inbox.</h2>
          <p>Get upcoming events, collaborations, cultural programming and community updates from {clubName}.</p>
        </div>
        <div className="newsletter-card"><NewsletterForm source="homepage-inline" {...formProps} /></div>
      </div>
    </section>

    {open && <div className="newsletter-popup-wrap" role="dialog" aria-modal="true" aria-label={`Join the ${shortName} newsletter`}>
      <section className="newsletter-popup">
        <button className="newsletter-close" onClick={dismiss} aria-label="Dismiss newsletter signup">×</button>
        <span className="kicker">{shortName} updates</span>
        <h2>Don’t miss what’s next.</h2>
        <p>Join the club newsletter for event announcements and community updates.</p>
        <NewsletterForm source="homepage-popup" {...formProps} />
      </section>
    </div>}
  </>;
}
