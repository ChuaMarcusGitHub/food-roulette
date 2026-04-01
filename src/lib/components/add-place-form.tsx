import { useState, type FormEvent } from "react";
import {
  derivePlaceNameFromGoogleMapsUrl,
  isGoogleMapsUrl,
  isGoogleMapsShortUrl,
} from "@/lib/utils/map-embed";
import { t } from "@translate";
interface AddPlaceFormProps {
  busy: boolean;
  onAdd: (name: string, url: string) => Promise<void>;
  showNotice: (text: string, isError?: boolean) => void;
}

/** Add a place from a Google Maps URL only; name is derived from the link. */
export const AddPlaceForm = ({
  busy,
  onAdd,
  showNotice,
}: AddPlaceFormProps) => {
  const [url, setUrl] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const u = url.trim();
    if (!u) {
      showNotice(t("group.err_add_url"), true);
      return;
    }
    let parsed: URL;
    try {
      parsed = new URL(u);
    } catch {
      showNotice(t("group.err_url_invalid"), true);
      return;
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      showNotice(t("group.err_url_scheme"), true);
      return;
    }
    if (!isGoogleMapsUrl(u)) {
      showNotice(t("group.err_google_maps_only"), true);
      return;
    }
    let normalizedUrl = u;
    if (isGoogleMapsShortUrl(u)) {
      try {
        const r = await fetch(
          `/api/maps/resolve?url=${encodeURIComponent(u)}`,
          {
            cache: "no-store",
          },
        );
        if (r.ok) {
          const data = (await r.json()) as { resolvedUrl?: string };
          if (data?.resolvedUrl) normalizedUrl = data.resolvedUrl;
        }
      } catch {
        // Keep short URL if resolve fails; backend/UI will still work as best-effort.
      }
    }

    const name = derivePlaceNameFromGoogleMapsUrl(normalizedUrl);
    void onAdd(name, normalizedUrl).then(() => {
      setUrl("");
    });
  }

  const inputId = "add-place-google-url";

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {t("group.add_title_google")}
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t("group.add_hint_google_only")}
      </p>
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="mt-4 flex flex-col gap-4"
      >
        <div>
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            {t("group.add_url_label")}
          </label>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {t("group.add_name_auto_hint")}
          </p>
          <input
            id={inputId}
            name="google-maps-url"
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder={t("group.google_maps_url_ph")}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-teal-600 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            disabled={busy}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-teal-700 dark:hover:bg-teal-600"
        >
          {t("group.save_place")}
        </button>
      </form>
    </section>
  );
};
