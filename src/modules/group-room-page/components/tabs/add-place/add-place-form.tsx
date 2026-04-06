import { useState, type SubmitEvent } from "react";

import { t } from "@translate";
import { useNotice } from "@/lib/hooks";
import { Button, Input, PText } from "@/lib/components";
import {
  derivePlaceNameFromGoogleMapsUrl,
  isGoogleMapsShortUrl,
  validateGoogleMapsUrl,
} from "@/lib/utils/google-url-utils";
interface IAddPlaceFormProps {
  busy: boolean;
  handleAddPlace: (name: string, url: string) => Promise<void>;
}

export const AddPlaceForm: React.FC<IAddPlaceFormProps> = ({
  busy,
  handleAddPlace,
}) => {
  const { postNotice } = useNotice();
  const [url, setUrl] = useState("");

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const u = url.trim();

    const validationError = validateGoogleMapsUrl(u);

    if (validationError) {
      postNotice({ text: validationError, variant: "error" });
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
    void handleAddPlace(name, normalizedUrl).then(() => {
      setUrl("");
    });
  }

  const inputId = "add-place-google-url";

  return (
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
        <PText variant={"mutedXs"} className={"mt-0.5"}>
          {t("group.add_name_auto_hint")}
        </PText>
        <Input
          id={inputId}
          name={"google-maps-url"}
          type={"text"}
          inputMode={"url"}
          autoComplete={"off"}
          spellCheck={false}
          placeholder={t("group.google_maps_url_ph")}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={"mt-2"}
          disabled={busy}
        />
      </div>
      <Button type={"submit"} intent={"submit"} disabled={busy}>
        {t("group.save_place")}
      </Button>
    </form>
  );
};
