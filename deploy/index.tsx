import Adapt, { Group, handle } from "@adpt/core";
import { HttpServer, UrlRouter } from "@adpt/cloud/http";
import { NodeService } from "@adpt/cloud/nodejs";
import { Postgres } from "@adpt/cloud/postgres";
import { k8sStyle } from "./styles";

function App() {
    const pg = handle();
    const api = handle();
    const stat = handle();

    return <Group key="App">

        <UrlRouter
            port={8080}
            routes={[
                { path: "/api/", endpoint: api },
                { path: "/", endpoint: stat }
            ]} />

        <NodeService handle={api} srcDir=".." connectTo={pg} />

        <Postgres handle={pg} />

        <HttpServer handle={stat} scope="cluster-internal"
            add={[{ type: "image", image: api, stage: "app",
                    files: [{ src: "/app/build", dest: "/www/static" }]}]} />

    </Group>;
}

Adapt.stack("default", <App />, k8sStyle)
Adapt.stack("k8s", <App />, k8sStyle);
