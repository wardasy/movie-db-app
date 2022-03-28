import Adapt, { concatStyles, Style } from "@adpt/core";
import { Service, ServiceProps } from "@adpt/cloud";
import { HttpServer, HttpServerProps, UrlRouter, UrlRouterProps } from "@adpt/cloud/http";
import { ServiceDeployment } from "@adpt/cloud/k8s";
import * as nginx from "@adpt/cloud/nginx";
import { Postgres, TestPostgres } from "@adpt/cloud/postgres";
import * as fs from "fs";

export function kubeconfig() {
    let configPath = process.env.KUBECONFIG;
    if (!configPath) {
        configPath = "./kubeconfig.json";
        if (!fs.existsSync(configPath)) {
            throw new Error(`Cannot find kubeconfig. Environment variable KUBECONFIG not set and ${configPath} not found`);
        }
    }
    return {
        kubeconfig: require(configPath)
    }
}

// Terminate containers quickly for demos
const demoProps = {
    podProps: { terminationGracePeriodSeconds: 0 }
};

/*
 * Style rules common to all style sheets
 */
export const commonStyle =
    <Style>
        {HttpServer} {Adapt.rule<HttpServerProps>(({ handle, ...props }) =>
            <nginx.HttpServer {...props} />)}

        {UrlRouter} {Adapt.rule<UrlRouterProps>(({ handle, ...props }) =>
            <nginx.UrlRouter {...props} />)}
    </Style>;

/*
 * Kubernetes testing style
 */
export const k8sStyle = concatStyles(commonStyle,
    <Style>
        {Postgres} {Adapt.rule(() =>
            <TestPostgres mockDbName="test_db" mockDataPath="./test_db.sql" />)}

        {Service} {Adapt.rule<ServiceProps>(({ handle, ...props }) =>
            <ServiceDeployment config={kubeconfig()} {...props} {...demoProps} />)}
    </Style>);
