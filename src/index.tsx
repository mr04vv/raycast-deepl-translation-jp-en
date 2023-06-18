import { ActionPanel, List, Action, getPreferenceValues, Detail } from "@raycast/api";
import { useEffect, useState } from "react";
import axios from "axios";

type APIKeyPreference = {
  apiKey: string;
};
export default function Command() {
  const [text, setText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const { apiKey } = getPreferenceValues<APIKeyPreference>();

  const isJa = (text: string) => {
    for (let i = 0; i < text.length; i++) {
      //言語判別
      if (text.charCodeAt(i) >= 256) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    (async () => {
      if (text) {
        const isJ = isJa(text);
        setIsLoading(true);
        const targetLang = isJ ? "EN" : "JA";
        const content = encodeURI("auth_key=" + apiKey + "&text=" + text + "&target_lang=" + targetLang);
        const url = "https://api-free.deepl.com/v2/translate" + "?" + content;
        try {
          const response = await axios.get(url);
          setIsLoading(false);
          setTranslations(response.data.translations);
        } catch (error) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    })();
  }, [text]);

  return (
    <List
      isLoading={isLoading}
      throttle
      isShowingDetail={true}
      onSearchTextChange={(txt) => {
        setText(txt);
      }}
    >
      {hasError ? null : (
        <>
          <List.Item key={"search result"} title={"検索結果"} />
          {translations &&
            translations.map((translation) => (
              <List.Item
                actions={
                  <ActionPanel>
                    {copyAction(translation.text)}
                    {pasteAction(translation.text)}
                  </ActionPanel>
                }
                key={translation.text}
                title={translation.text}
                detail={<List.Item.Detail markdown={`${translation.text}`} />}
              />
            ))}
        </>
      )}
    </List>
  );
}

interface Translation {
  detected_source_language: string;
  text: string;
}

function copyAction(url: string) {
  return <Action.CopyToClipboard content={`${url}`} shortcut={{ modifiers: [], key: "enter" }} />;
}

function pasteAction(url: string) {
  return <Action.Paste content={`${url}`} shortcut={{ modifiers: ["cmd"], key: "enter" }} />;
}
