import { Form, useLoaderData, useSearchParams } from "remix";
import { useState } from "react";
import type { MetaFunction, LinksFunction, LoaderFunction } from "remix";
import searchUrl from "../styles/search-input.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: searchUrl }];
};

export const meta: MetaFunction = () => {
  return {
    title: "Remix && StepZen",
    description: "Knowledge-annotated Spotify search"
  };
};

export const loader: LoaderFunction = ({ request }) => {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "Beatles Norwegian Wood";
  return getStepzen(search);
};

export async function getStepzen(search: string){
  let res = await fetch(`${process.env.STEPZEN_ENDPOINT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `${process.env.STEPZEN_API_KEY}`
    },
    body: JSON.stringify({
      query: `
        query MyQuery($query: String!) {
          spotify_Search_Sequence(q: $query) {
            id
            artist
            track
            album
            artistInfo {
              description
              name
              detailedDescription {
                articleBody
              }
            }
            trackInfo {
              description
              detailedDescription {
                articleBody
              }
              name
            }
            albumInfo {
              name
              description
              detailedDescription {
                articleBody
              }
            }
          }
        }`,
      variables: {
        query: search,
      },
    }),
  })
  console.log("res", res)
  return res.json();
}

export default function Index() {
  const { spotify_Search_Sequence: song } = useLoaderData().data;
  console.log('song from component', song)
  const [search, setSearch] = useState(useSearchParams()[0].get("search") ?? "");

  return (
    <div className="remix-stepzen">
      <nav>
      <img src="../../favicon.ico"/><h3>Remix, <img src="../../graphql.svg"/>GraphQL, and <img src="../../stepzen.svg"/>StepZen</h3>
      </nav>
      <Form method="get" className="search-form">
        <input
          defaultValue={search}
          placeholder="Band & Song..."
          autoComplete="off"
          name="search"
          type="search"
        />
        <button type="submit">
          Spotify + Knowledge
        </button>
      </Form>
      <main>
        { song ? (
          <div className="song-info">
            <h4>{song.track}</h4>
            <h5>{song.trackInfo[0]?.detailedDescription?.articleBody || song.trackInfo[0]?.description || "no data"}</h5>
            <h4>{song.artist}</h4>
            <h5>{song.artistInfo[0]?.detailedDescription?.articleBody || song.artistInfo[0]?.description || "no data"}</h5>
            <h4>{song.album}</h4>
            <h5>{song.albumInfo[0]?.detailedDescription?.articleBody || song.albumInfo[0]?.description || "no data"}</h5>
          </div>
          ) : <h4>No Results</h4> 
        }
      </main>
    </div>
  );
}