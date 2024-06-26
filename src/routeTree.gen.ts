/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as TemplateIdImport } from './routes/$templateId'
import { Route as IndexImport } from './routes/index'
import { Route as TemplateIdDashboardIdImport } from './routes/$templateId.$dashboardId'

// Create/Update Routes

const TemplateIdRoute = TemplateIdImport.update({
  path: '/$templateId',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const TemplateIdDashboardIdRoute = TemplateIdDashboardIdImport.update({
  path: '/$dashboardId',
  getParentRoute: () => TemplateIdRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/$templateId': {
      preLoaderRoute: typeof TemplateIdImport
      parentRoute: typeof rootRoute
    }
    '/$templateId/$dashboardId': {
      preLoaderRoute: typeof TemplateIdDashboardIdImport
      parentRoute: typeof TemplateIdImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  TemplateIdRoute.addChildren([TemplateIdDashboardIdRoute]),
])

/* prettier-ignore-end */
