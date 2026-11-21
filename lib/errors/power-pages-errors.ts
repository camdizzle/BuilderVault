import { code, learnDoc, note, ol, p, table, ul } from "../guides/types";
import type { ErrorPage } from "./types";

const base = { product: "Power Pages" as const, published: "2026-11-21", updated: "2026-11-21" };
const pagesDoc = (page: string, label: string) => learnDoc(`power-pages/${page}`, label);

const webApiErrorsDoc = pagesDoc("configure/web-api-http-requests-handle-errors", "Compose HTTP requests and handle errors for the Power Pages Web API");
const webApiOverviewDoc = pagesDoc("configure/web-api-overview", "Power Pages Web API overview");
const tablePermissionsDoc = pagesDoc("security/table-permissions", "Table permissions in Power Pages");
const columnPermissionsDoc = pagesDoc("security/column-permissions", "Column permissions in Power Pages");
const siteSettingsDoc = pagesDoc("configure/configure-site-settings", "Configure site settings in Power Pages");

const errorShape = `{
  "error": {
    "code": "90040101",
    "message": "Attribute emailaddress1 in table contact is not enabled for Web Api.",
    "cdscode": ""
  }
}`;

const attributeNotEnabled: ErrorPage = {
  ...base,
  slug: "attribute-in-table-is-not-enabled-for-web-api-power-pages",
  message: "Attribute {0} in table {1} is not enabled for Web Api.",
  title: "Fix \"Attribute is not enabled for Web Api\" in Power Pages",
  shortTitle: "Attribute is not enabled for Web Api",
  description: "Why a Power Pages Web API call fails with error 90040101 when it reads or writes a column that the site has not exposed, and how to list the column in site settings or the Power Pages Web API Columns view.",
  keywords: ["is not enabled for Web Api", "90040101 Power Pages", "AttributePermissionIsMissing", "Webapi fields site setting", "Power Pages Web API Columns view"],
  quickAnswer: "The request used a column that the site has not made available to the Web API. Each table needs a Webapi/<table>/enabled site setting set to true, and its columns listed either in a Webapi/<table>/fields site setting, as a comma-separated list of logical names, or in a system view named Power Pages Web API Columns. Add the column named in the message, using its logical name, and clear the cache or wait a few minutes.",
  variants: [
    "90040101 AttributePermissionIsMissing",
    "Attribute emailaddress1 in table contact is not enabled for Web Api.",
    "403 Forbidden: AttributePermissionIsMissing"
  ],
  meaning: [
    p("The Power Pages Web API, at `/_api/`, only exposes what the site allows. A table must be switched on with a site setting, and each column the site's JavaScript reads or writes must be listed. Anything not listed is refused with HTTP 403 and code 90040101, and the message names the column and table."),
    code(errorShape, "Response body"),
    p("Microsoft's error list calls this `AttributePermissionIsMissing`. It is about the column list in site settings, not about the user's table permissions, which give a different message.")
  ],
  causes: [
    ol(
      "The column is not in the `Webapi/<table-name>/fields` site setting.",
      "The setting uses `*` for all columns. Microsoft has deprecated the wildcard, and says requests for tables configured with `*` fail until explicit column names are given.",
      "The column was added to the **Power Pages Web API Columns** view, but `Webapi/<table-name>/UseFieldsFromView` is not set to true, or the change has not shown up yet.",
      "The request uses the display name, schema name or entity set name of the column instead of its logical name.",
      "A lookup column is requested by its plain name instead of its OData property, such as `_primarycontactid_value`."
    )
  ],
  fixes: [
    p("**Option 1: list the column in the site setting.** In the Portal Management app, open **Site Settings** for your website and edit, or create, these:"),
    table(
      ["Name", "Value"],
      ["`Webapi/contact/enabled`", "`true`"],
      ["`Webapi/contact/fields`", "`firstname,lastname,emailaddress1`"]
    ),
    p("Use the table's logical name, such as `contact`, in the setting name, and the columns' logical names in the value."),
    p("**Option 2: use a system view.** Microsoft added this for site version 9.8.8.x and later:"),
    ol(
      "In the design studio's Data workspace, select the table, open **Views** and create a public view named **Power Pages Web API Columns**.",
      "Add the columns the site needs, then save and publish the view.",
      "In the Portal Management app, add the site setting `Webapi/<table-name>/UseFieldsFromView` with the value `true`.",
      "Check that `Webapi/<table-name>/enabled` is `true`."
    ),
    p("Microsoft says view changes can take up to five minutes to reach the Web API. Columns from related tables, and columns used only for sorting or filtering in the view, are not included. If both the view and the fields setting are configured, their columns are combined."),
    note("If you still use `*`, replace it with the list of columns your site needs. Listing only what the page uses also keeps data you did not mean to publish off the API.")
  ],
  prevention: [
    ul(
      "Keep the column list next to the JavaScript that calls the API, and update both together.",
      "Turn on `Webapi/error/innererror` on development sites only, to see more detail while building.",
      "Move site settings between environments with your solution or deployment profile so test and production match."
    )
  ],
  faqs: [
    { question: "What does error 90040101 mean in Power Pages?", answer: "The Web API request used a column that is not listed for that table in the site's Web API settings. Add the column's logical name to Webapi/<table>/fields, or to the Power Pages Web API Columns view with UseFieldsFromView set to true." },
    { question: "Can I still use * in Webapi fields?", answer: "Microsoft has deprecated the wildcard and says requests for tables configured with * fail until explicit column names are configured. List the columns instead." },
    { question: "Does this error mean the user lacks permission?", answer: "No. It is about which columns the site exposes. A missing table permission gives a different error, such as You don't have permission to create the entity." }
  ],
  relatedTools: [],
  relatedPatterns: [],
  relatedLinks: [],
  relatedErrors: ["you-dont-have-permission-to-create-entity-power-pages", "attribute-cannot-be-found-for-table-power-pages", "resource-not-found-for-the-segment-power-pages-web-api"],
  sources: [webApiOverviewDoc, webApiErrorsDoc, siteSettingsDoc]
};

const noCreatePermission: ErrorPage = {
  ...base,
  slug: "you-dont-have-permission-to-create-entity-power-pages",
  message: "You don't have permission to create {0} entity.",
  title: "Fix \"You don't have permission to create entity\" in Power Pages",
  shortTitle: "You don't have permission to create entity",
  description: "Why a Power Pages form, list or Web API call fails because the visitor's web role has no table permission to create, update or delete the record, and how to set up the table permission.",
  keywords: ["You don't have permission to create entity", "90040103 Power Pages", "TablePermissionCreateIsMissing", "Power Pages table permissions web role", "You don't have permission to update entity"],
  quickAnswer: "The visitor's web roles have no table permission that allows this action on this table. Power Pages checks table permissions for every form, list and Web API call. Create a table permission for the table with the right access type and the Create, Write or Delete privilege, and assign it to a web role the visitor has, such as Authenticated Users. For anonymous forms, use the Anonymous Users role.",
  variants: [
    "90040103 TablePermissionCreateIsMissing",
    "You don't have permission to update {0} entity. (90040102)",
    "You don't have permission to delete {0} entity. (90040104)",
    "You don't have permission to associate or disassociate table {0} with {1}. (90040105)"
  ],
  meaning: [
    p("Power Pages does not use the visitor's Dataverse security roles. It uses **table permissions**, each tied to one table and granted to one or more **web roles**. If none of the visitor's web roles has a table permission with the privilege the action needs, the action is refused."),
    table(
      ["Code", "Message", "Missing privilege"],
      ["90040103", "You don't have permission to create {0} entity.", "Create"],
      ["90040102", "You don't have permission to update {0} entity.", "Write"],
      ["90040104", "You don't have permission to delete {0} entity.", "Delete"],
      ["90040105, 90040106", "You don't have permission to associate or disassociate table…", "Append or Append to"]
    ),
    p("In the Web API, these come back as HTTP 403. On a form, the visitor sees an error instead of the form or when saving.")
  ],
  causes: [
    ol(
      "No table permission exists for the table.",
      "A table permission exists but does not include the privilege, such as Create.",
      "The table permission is not assigned to any web role the visitor has, or the visitor is anonymous and the permission is only on Authenticated Users.",
      "The access type does not cover the record, for example **Contact** access when the record is not linked to the visitor's contact.",
      "A child table permission's parent permission is missing one of the child's web roles.",
      "Creating a record with a lookup also needs Append on the new record's table and Append to on the related table."
    )
  ],
  fixes: [
    ol(
      "In the design studio, open **Security**, then **Table permissions**, or open **Table permissions** in the Portal Management app.",
      "Create a permission for the table named in the message, or open the existing one.",
      "Choose the access type: **Global** for every record, **Contact** or **Account** for records linked to the visitor, **Self** for the visitor's own contact, or **Parent** for records under another permission.",
      "Tick the privileges the page needs: Read, Write, Create, Delete, Append, Append to.",
      "Add the web roles that need it: **Authenticated Users**, **Anonymous Users** for public forms, or a custom role.",
      "Save, then sign out and back in, or clear the cache, and try again."
    ),
    note("Global access with Create for Anonymous Users lets anyone on the internet create records in that table. Use it only for genuinely public forms, and prefer Contact or Account access for anything signed in.")
  ],
  prevention: [
    ul(
      "Create the table permission at the same time as the form or list, not after the first failed test.",
      "Test pages as an anonymous visitor and as an ordinary signed-in user, not only as an administrator.",
      "Use the site checker and security scan in the design studio to find tables without permissions."
    )
  ],
  faqs: [
    { question: "What does You don't have permission to create entity mean in Power Pages?", answer: "None of the visitor's web roles has a table permission with the Create privilege for that table. Add Create to a table permission for the table and assign it to the visitor's web role." },
    { question: "Do Dataverse security roles apply to Power Pages visitors?", answer: "No. Visitors are controlled by web roles and table permissions configured in the site, not by Dataverse security roles." },
    { question: "Why can I save a record but my users cannot?", answer: "You may be testing with an administrator web role that has wider permissions. Test with an account that has only the roles your users have." }
  ],
  relatedTools: [],
  relatedPatterns: [],
  relatedLinks: [],
  relatedErrors: ["table-permissions-should-be-enabled-for-this-record-power-pages", "attribute-in-table-is-not-enabled-for-web-api-power-pages"],
  sources: [webApiErrorsDoc, tablePermissionsDoc, pagesDoc("security/assign-table-permissions", "Assign table permissions")]
};

const antiForgery: ErrorPage = {
  ...base,
  slug: "anti-forgery-cookie-token-and-form-field-token-do-not-match-power-pages",
  message: "The anti-forgery cookie token and form field token do not match.",
  title: "Fix \"The anti-forgery cookie token and form field token do not match\" in Power Pages",
  shortTitle: "Anti-forgery token does not match",
  description: "Why a Power Pages Web API call or form submit fails the request verification check, how to send the __RequestVerificationToken header correctly, and what breaks the token.",
  keywords: ["anti-forgery cookie token and form field token do not match", "90040107 Power Pages", "__RequestVerificationToken Power Pages", "MissingPortalRequestVerificationToken", "Power Pages Web API CSRF token"],
  quickAnswer: "Every Power Pages Web API call that changes data must carry a CSRF token in a __RequestVerificationToken header, and it must match the token cookie the browser holds for the current session. This error means the two did not match: the header was missing, stale, cached, or fetched in a different session. Get a fresh token with shell.getTokenDeferred() right before each call, as in Microsoft's safeAjax wrapper.",
  variants: [
    "90040107 HttpAntiForgeryException",
    "401 Unauthorized: MissingPortalRequestVerificationToken",
    "An Invalid session token was passed into the throwing method. (90040109 MissingPortalSessionCookie)"
  ],
  meaning: [
    p("Power Pages protects its Web API against cross-site request forgery. The page gets a token, sends it back in the `__RequestVerificationToken` header, and the server compares it with a cookie set for the same session. Microsoft's documentation says all Web API calls must include the token."),
    p("Code 90040107 means a token arrived but did not match. A 401 with `MissingPortalRequestVerificationToken` means none arrived. `MissingPortalSessionCookie` means the session cookie itself is missing.")
  ],
  causes: [
    ol(
      "The call does not send the header at all, often a plain `fetch` or `$.ajax` written from scratch.",
      "The token was fetched once and reused after the visitor signed in or out, which starts a new session.",
      "A page or a response containing the token was cached, so visitors received someone else's token.",
      "The browser blocks the site's cookies, for example when the site is embedded in another site in a frame.",
      "The call is made to a different host name than the page, so the cookie is not sent."
    )
  ],
  fixes: [
    p("**Use Microsoft's wrapper.** Get the token right before each call and add it as a header:"),
    code(`(function (webapi, $) {
  function safeAjax(ajaxOptions) {
    var deferredAjax = $.Deferred();
    shell.getTokenDeferred().done(function (token) {
      ajaxOptions.headers = ajaxOptions.headers || {};
      ajaxOptions.headers["__RequestVerificationToken"] = token;
      $.ajax(ajaxOptions)
        .done(function (data, textStatus, jqXHR) {
          validateLoginSession(data, textStatus, jqXHR, deferredAjax.resolve);
        })
        .fail(deferredAjax.reject);
    }).fail(function () {
      deferredAjax.rejectWith(this, arguments);
    });
    return deferredAjax.promise();
  }
  webapi.safeAjax = safeAjax;
})(window.webapi = window.webapi || {}, jQuery);`, "JavaScript"),
    p("Then call `webapi.safeAjax({ type: \"POST\", url: \"/_api/accounts\", contentType: \"application/json\", data: JSON.stringify({ name: \"Sample\" }) })`."),
    ul(
      "Do not store the token in a variable for later. Fetch it for each call.",
      "Call the API on the same host name as the page.",
      "Turn off output caching for pages or web templates that render tokens."
    )
  ],
  prevention: [
    ul(
      "Put one shared `safeAjax` function in a web template or web file and use it for every call.",
      "Test after signing in and out in the same tab, which is when stale tokens show up.",
      "Avoid embedding the site in another site's frame if visitors need to save data."
    )
  ],
  faqs: [
    { question: "How do I get the anti-forgery token in Power Pages?", answer: "Call shell.getTokenDeferred() in the page's JavaScript and send the result in a __RequestVerificationToken header on the Web API request. Fetch it right before each call." },
    { question: "Why does the token work and then stop?", answer: "Signing in or out starts a new session with a new token cookie, so a token fetched earlier no longer matches. Fetch a fresh token for every request." },
    { question: "Do GET requests need the token?", answer: "Microsoft's documentation says all Web API calls must include the CSRF token, and its wrapper adds it to every request. Sending it every time avoids the question." }
  ],
  relatedTools: [],
  relatedPatterns: [],
  relatedLinks: [],
  relatedErrors: ["attribute-in-table-is-not-enabled-for-web-api-power-pages", "you-dont-have-permission-to-create-entity-power-pages"],
  sources: [webApiErrorsDoc, webApiOverviewDoc]
};

const invalidAttribute: ErrorPage = {
  ...base,
  slug: "attribute-cannot-be-found-for-table-power-pages",
  message: "Attribute {0} cannot be found for table {1}.",
  title: "Fix \"Attribute cannot be found for table\" in the Power Pages Web API",
  shortTitle: "Attribute cannot be found for table",
  description: "Why a Power Pages Web API call fails with error 90040100 when a column name is wrong, which name to use for ordinary, lookup and custom columns, and how to find the logical name.",
  keywords: ["Attribute cannot be found for table", "90040100 Power Pages", "InvalidAttribute Power Pages", "Power Pages Web API logical name", "_value lookup Power Pages Web API"],
  quickAnswer: "The request named a column that the table does not have under that name. The Web API uses logical names, which are lower case and include the publisher prefix for custom columns, such as cr43e_duedate, not display names. Web API operations are case-sensitive. For a lookup, read it as _columnname_value and set it with columnname@odata.bind. Check the exact name in the table's column properties.",
  variants: [
    "90040100 InvalidAttribute",
    "Attribute DueDate cannot be found for table cr43e_request.",
    "400 Bad Request: InvalidAttribute"
  ],
  meaning: [
    p("Code 90040100, `InvalidAttribute`, comes back with HTTP 400 when the request body, `$select`, `$filter` or `$orderby` uses a column name the table does not recognise. The message names the column and table as the API saw them, which usually shows the mistake straight away."),
    p("This is different from 90040101, where the column exists but has not been exposed. Here the name itself is wrong.")
  ],
  causes: [
    ol(
      "The display name or schema name was used instead of the logical name, such as `DueDate` instead of `cr43e_duedate`.",
      "Wrong capital letters. Microsoft notes that Web API operations are case-sensitive.",
      "A lookup column is set by its plain name instead of with `@odata.bind`, or read without the `_..._value` form.",
      "The publisher prefix is missing or wrong on a custom column.",
      "The column exists in development but not yet in the environment the site uses."
    )
  ],
  fixes: [
    ol(
      "In Power Apps, open **Tables**, the table, then **Columns**, and open the column's properties. Copy the **Logical name**.",
      "Use that name exactly, in lower case, in the request body and query options.",
      "For a lookup, read `_primarycontactid_value`, and set it with a body such as `{ \"primarycontactid@odata.bind\": \"/contacts(00000000-0000-0000-0000-000000000001)\" }`.",
      "Make sure the same name is in the table's `Webapi/<table>/fields` setting or the Web API columns view."
    ),
    code(`// Wrong: display name
{ "DueDate": "2026-12-01" }

// Right: logical name
{ "cr43e_duedate": "2026-12-01" }`, "Request body")
  ],
  prevention: [
    ul(
      "Keep a short list of the logical names your site's scripts use.",
      "Deploy table changes before the site code that depends on them.",
      "Test calls in the browser's developer tools and read the response body, which names the column."
    )
  ],
  faqs: [
    { question: "What does Attribute cannot be found for table mean?", answer: "The Web API request used a column name the table does not have. Use the column's logical name, which is lower case and includes the publisher prefix for custom columns." },
    { question: "How do I set a lookup column with the Power Pages Web API?", answer: "Use the lookup's name with @odata.bind and the related record's entity set and ID, as in \"primarycontactid@odata.bind\": \"/contacts(<id>)\"." },
    { question: "Is the Power Pages Web API case-sensitive?", answer: "Yes. Microsoft's overview notes that Web API operations are case-sensitive, so use logical names exactly as they appear in the table's column properties." }
  ],
  relatedTools: [],
  relatedPatterns: ["dataverse-set-lookup-odata-bind-power-automate"],
  relatedLinks: [],
  relatedErrors: ["attribute-in-table-is-not-enabled-for-web-api-power-pages", "resource-not-found-for-the-segment-power-pages-web-api", "undeclared-property-only-has-property-annotations-dataverse"],
  sources: [webApiErrorsDoc, webApiOverviewDoc, pagesDoc("configure/write-update-delete-operations", "Write, update and delete operations using the Web API")]
};

const resourceNotFound: ErrorPage = {
  ...base,
  slug: "resource-not-found-for-the-segment-power-pages-web-api",
  message: "Resource not found for the segment '{0}'.",
  title: "Fix \"Resource not found for the segment\" in the Power Pages Web API",
  shortTitle: "Resource not found for the segment (Power Pages)",
  description: "Why a Power Pages Web API call to /_api/ returns 404 with error 9004010C, the difference between the table's logical name and its entity set name, and the site setting that exposes a table.",
  keywords: ["Resource not found for the segment Power Pages", "9004010C", "ResourceDoesNotExists Power Pages", "Power Pages _api 404", "EntitySetName Power Pages Web API"],
  quickAnswer: "The URL after /_api/ does not match a table the site's Web API exposes. Use the table's entity set name in the URL, which is usually plural, such as /_api/accounts or /_api/cr43e_requests, but its logical name, such as account, in the site settings. Also check that Webapi/<table>/enabled is set to true for the site.",
  variants: [
    "9004010C ResourceDoesNotExists",
    "Resource not found for the segment 'account'.",
    "404 Not Found"
  ],
  meaning: [
    p("The Power Pages Web API reads the first segment of the path after `/_api/` as a table's **entity set name**. If no exposed table has that name, it returns HTTP 404 with code 9004010C. Microsoft's status table also lists 404 for a table that isn't exposed for the Web API."),
    p("The same wording appears in the Dataverse Web API itself, where the cause is similar. See the [Dataverse version of this error](/errors/resource-not-found-for-the-segment-dataverse) for flows and direct calls.")
  ],
  causes: [
    ol(
      "The URL uses the logical name, such as `/_api/account`, instead of the entity set name, `/_api/accounts`.",
      "A custom table's entity set name is not the logical name with an s added, for example a name ending in y.",
      "`Webapi/<table-name>/enabled` is missing or false for the site.",
      "The site setting uses the entity set name instead of the logical name.",
      "The table is a portal configuration table, which Microsoft says cannot be used through the Web API."
    )
  ],
  fixes: [
    p("**Find the entity set name.** Microsoft's steps:"),
    ol(
      "Go to make.powerapps.com and open the table under **Dataverse** in the side panel.",
      "Select the **...** commands menu, then **Advanced**, **Tools** and **Copy set name**.",
      "Use that name in the URL: `/_api/<entity set name>`."
    ),
    table(
      ["Where", "Use", "Example for Account"],
      ["Web API URL", "Entity set name", "`/_api/accounts`"],
      ["Site setting names", "Logical name", "`Webapi/account/enabled`"]
    ),
    p("**Check the site setting.** In the Portal Management app, make sure `Webapi/<logical name>/enabled` exists for the website with the value `true`, alongside its fields setting."),
    note("Microsoft's overview says the portals Web API is not supported for configuration tables, such as adx_contentsnippet or adx_entityform, and does not support calling Dataverse actions and functions.")
  ],
  prevention: [
    ul(
      "Copy the entity set name from the table instead of typing it.",
      "Keep each table's enabled and fields settings together in one place.",
      "Read the response body in the browser's developer tools: the segment it names is what the API received."
    )
  ],
  faqs: [
    { question: "Why does my Power Pages Web API call return 404?", answer: "The table in the URL is not exposed, or the URL uses the wrong name. Use the entity set name, usually plural, in the URL, and check that Webapi/<logical name>/enabled is true." },
    { question: "What is the difference between logical name and entity set name?", answer: "The logical name identifies the table, such as account, and is used in site settings. The entity set name is the collection name used in Web API URLs, such as accounts." },
    { question: "Can I call Dataverse actions through the Power Pages Web API?", answer: "No. Microsoft's overview says calling actions and functions through the portals Web API isn't supported." }
  ],
  relatedTools: [],
  relatedPatterns: [],
  relatedLinks: [],
  relatedErrors: ["resource-not-found-for-the-segment-dataverse", "attribute-in-table-is-not-enabled-for-web-api-power-pages", "attribute-cannot-be-found-for-table-power-pages"],
  sources: [webApiErrorsDoc, webApiOverviewDoc]
};

const permissionsWarning: ErrorPage = {
  ...base,
  slug: "table-permissions-should-be-enabled-for-this-record-power-pages",
  message: "Table permissions should be enabled for this record or anyone on the internet can view the data.",
  title: "Fix \"Table permissions should be enabled for this record or anyone on the internet can view the data\"",
  shortTitle: "Table permissions should be enabled",
  description: "What the Power Pages warning about table permissions on a form or list means, why it is a real security risk, and how to turn on table permissions without locking out your visitors.",
  keywords: ["Table permissions should be enabled for this record or anyone on the internet can view the data", "Power Pages Enable Table Permissions", "Power Pages basic form security", "Power Pages list table permissions", "Power Pages data exposed"],
  quickAnswer: "A form or list on the site is set up without table permissions, so anyone who can open the page can see the records it shows. Turn on table permissions for the form or list, then create table permissions for the table, scoped to the visitor where possible, and assign them to the web roles that should have access. Test as an anonymous visitor afterwards.",
  variants: [
    "Table permissions should be enabled for this record or anyone on the internet can view the data."
  ],
  meaning: [
    p("This is a warning, shown in the maker experience, not an error a visitor sees. Microsoft's basic forms article quotes it for a form that is configured with table permissions turned off. Without table permissions, the form or list does not check who the visitor is before showing data."),
    p("Microsoft's guidance is that this way of leaving forms open is being phased out and should not be used. Newer sites enforce table permissions on lists regardless of the setting, from release 9.3.7.x.")
  ],
  causes: [
    ol(
      "The form or list was created on an older site, where **Enable Table Permissions** defaulted to off.",
      "Table permissions were turned off while testing and never turned back on.",
      "A site was copied or moved from an older environment with its old settings."
    )
  ],
  fixes: [
    ol(
      "Open the form or list. In the Portal Management app, select **Enable Table Permissions**.",
      "Create a table permission for the table, with the narrowest access type that works: **Contact** or **Account** for a visitor's own records, **Global** only for data meant for everyone.",
      "Tick only the privileges the page needs, such as Read for a list.",
      "Assign the permission to the right web roles: **Authenticated Users** for signed-in visitors, **Anonymous Users** only if the data is public.",
      "Test the page as an anonymous visitor and as an ordinary signed-in user."
    ),
    note("Turning table permissions on with no permissions defined hides the data from everyone. Create the permission first if visitors are already using the page.")
  ],
  prevention: [
    ul(
      "Never leave a production form or list with table permissions off.",
      "Protect pages that only some visitors should open with page permissions as well, as Microsoft recommends for lists.",
      "Run the design studio's security scan and site checker before publishing changes."
    )
  ],
  faqs: [
    { question: "Is the table permissions warning in Power Pages serious?", answer: "Yes. It means the form or list does not check who the visitor is, so anyone who can reach the page can see the data. Turn on table permissions and define who may read what." },
    { question: "Why does my list show no records after enabling table permissions?", answer: "There is no table permission granting Read to the visitor's web role, or its access type does not cover those records. Add or adjust the table permission." },
    { question: "Do new Power Pages sites need this setting?", answer: "Microsoft says that from release 9.3.7.x, newly created sites enforce table permissions for all lists regardless of the setting. Older sites and forms still need checking." }
  ],
  relatedTools: [],
  relatedPatterns: [],
  relatedLinks: [],
  relatedErrors: ["you-dont-have-permission-to-create-entity-power-pages"],
  sources: [
    pagesDoc("configure/basic-forms", "About basic forms"),
    pagesDoc("configure/securing-lists", "Securing lists"),
    tablePermissionsDoc,
    columnPermissionsDoc
  ]
};

export const powerPagesErrors: ErrorPage[] = [attributeNotEnabled, noCreatePermission, antiForgery, invalidAttribute, resourceNotFound, permissionsWarning];
