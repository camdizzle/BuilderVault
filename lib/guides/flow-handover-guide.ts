import { automateDoc, code, learnDoc, note, ol, p, section, table, ul, type Guide } from "./types";

const published = "2026-11-21";

export const flowHandoverGuide: Guide = {
  slug: "hand-over-power-automate-flows-when-someone-leaves",
  title: "Hand over Power Automate flows when someone leaves",
  shortTitle: "Hand over flows when someone leaves",
  description: "A checklist for moving cloud flows to a new owner before, or after, the person who built them leaves: finding their flows, changing the owner, replacing connections, licensing, and stopping it happening again.",
  eyebrow: "Power Automate how-to",
  keywords: ["Power Automate flow owner left organization", "change owner of Power Automate flow", "orphaned flows Power Automate", "transfer flow ownership", "flow stopped working after employee left"],
  published,
  updated: published,
  quickAnswer: "Changing the owner is only half the job. A flow keeps running while it has an active owner, but every action that uses the departed person's connections fails once their account is disabled. Before they leave: list their flows, add a co-owner or change the owner, and replace their connections with the new owner's or a service account's. For solution flows you can change the primary owner in Details. For flows outside a solution, add them to a solution first, or have a co-owner keep them running. If they have already left, an administrator can add a co-owner from the Power Platform admin center.",
  sections: [
    section(
      "what-breaks",
      "What actually breaks",
      table(
        ["Part of the flow", "What happens when the person's account is disabled"],
        ["Ownership", "The flow keeps running if another owner is still active. With no active owner it is orphaned and only administrators can reach it."],
        ["Connections", "Actions that use the person's connections fail, because those connections sign in as them."],
        ["Licence", "A scheduled or automated flow runs under its owner's licence. Premium flows need a premium licence on the new owner."],
        ["Triggers on their data", "A trigger on their own mailbox, OneDrive or calendar has nothing left to watch."]
      ),
      p("Microsoft's sharing article puts it plainly: if a shared flow still has an active owner it continues to run, but actions using connections that belonged to the person who left might fail. That is why changing the owner alone is not enough. The [user account is disabled](/errors/user-account-is-disabled-power-automate-connection) and [refresh token expired](/errors/refresh-token-expired-due-to-inactivity-power-automate) errors are what you see when it goes wrong.")
    ),
    section(
      "before",
      "Before they leave: the checklist",
      ol(
        "**List their flows.** In each environment, they open **My flows** and check **Cloud flows** and **Shared with me**. An administrator can list everything they created across an environment, as shown below.",
        "**Decide each flow's future.** Keep it with a new owner, move it to a service account, or turn it off. Old flows nobody needs are best switched off now, not discovered later.",
        "**Add the new owner as a co-owner** with **Share** on each flow, so there is always an active owner.",
        "**Change the primary owner** for flows in a solution: open the flow, **Details**, **Edit**, and replace the owner. Microsoft says the original and new owners both become co-owners afterwards.",
        "**Replace every connection** that signs in as the leaver. Edit each action, or each connection reference in a solution, and pick the new owner's or a service account's connection. Co-owners cannot change the credentials of a connection another owner created, so the new owner makes new ones.",
        "**Check triggers on personal data**, such as their inbox or OneDrive, and repoint them to a shared mailbox or a SharePoint library.",
        "**Check licences.** If the flow uses premium connectors, the new owner needs a premium licence, or the flow needs a Process licence.",
        "**Run each flow** once as the new owner and check that it succeeds."
      ),
      note("After an owner change, Microsoft says a scheduled or automated flow can take up to seven days to start using the new owner's licence. Editing and saving the flow applies it straight away.")
    ),
    section(
      "non-solution",
      "Flows that are not in a solution",
      p("You cannot change the primary owner of a flow that is not in a solution, because the owner is part of the flow's identity. Microsoft gives these options:"),
      ul(
        "**If the environment has Dataverse,** add the flow to a solution, then change its owner.",
        "**Keep it running with a co-owner.** The flow continues while a co-owner is active. Replace the leaver's connections either way.",
        "**Without Dataverse,** the new owner creates their own copy with export and import, **Save as**, or **Send a copy**. That makes a new flow, so turn the old one off once the copy works."
      )
    ),
    section(
      "after",
      "After they have left",
      p("If nobody else owned the flow, an administrator has to step in. In the Power Platform admin center, open the environment, then **Resources**, **Flows**, and look for flows with no owner in the **Owners** column. Select a flow, choose **Share**, and add the new owner."),
      p("For many flows, Microsoft's support article uses the Power Apps administration PowerShell module:"),
      code(`# Flows created by the person who left
Get-AdminFlow -EnvironmentName <environment name> -CreatedBy <user object id>

# Add a co-owner to one flow
Set-AdminFlowOwnerRole -EnvironmentName <environment name> -FlowName <flow name> \`
  -PrincipalType User -RoleName CanEdit -PrincipalObjectId <new owner object id>`, "PowerShell"),
      p("Then the new co-owner replaces the connections, as in the checklist. The [orphaned apps and flows pattern](/patterns/find-orphaned-apps-and-flows-powershell) has a script to find every flow without a valid owner.")
    ),
    section(
      "licensing",
      "Licensing during the handover",
      p("Microsoft's change-owner article says that if the new owner has no premium licence and the flow uses premium features, the change still goes through and the flow runs for 30 days, after which it is turned off until a licence is assigned. Its licensing FAQ describes a related case, an owner who loses their premium licence: the flow is slowed down, owners are notified, and it is turned off after 14 days if nothing is done. Sort out the licence before the handover rather than relying on either grace period.")
    ),
    section(
      "prevent",
      "Stop it happening again",
      ul(
        "**Build business flows in solutions,** with connection references, so ownership and connections can be changed in one place. See the [connection references pattern](/patterns/connection-references-for-solution-flows).",
        "**Give every important flow a second owner,** a person or, where your tenant allows it, a SharePoint list or a group.",
        "**Use service accounts or a service principal** for flows that belong to a team rather than a person. Microsoft supports flows owned by a service principal application user, which does not leave the organization. Its connections must be shared with it.",
        "**Add flow review to the leavers process,** so IT tells the platform team a week before the account is disabled.",
        "**Audit owners regularly.** The [reassign apps and flows pattern](/patterns/reassign-apps-flows-when-maker-leaves) and the Center of Excellence starter kit both help."
      )
    )
  ],
  faqs: [
    { question: "What happens to Power Automate flows when the owner leaves the organization?", answer: "If another owner is still active, the flow keeps running, but actions that use the departed person's connections fail once their account is disabled. If there is no other owner, the flow is orphaned and an administrator must add a co-owner." },
    { question: "How do I change the owner of a Power Automate flow?", answer: "For a flow in a solution, open it, select Details then Edit, and replace the primary owner. For a flow outside a solution, add it to a solution first if the environment has Dataverse, or have the new owner make a copy." },
    { question: "Can an administrator take over a flow from someone who has left?", answer: "Yes. In the Power Platform admin center, open the environment's flows, select the flow, choose Share and add a new owner. For many flows, use Set-AdminFlowOwnerRole in PowerShell." },
    { question: "Do I need to recreate the connections after changing the owner?", answer: "Yes, for any connection that signs in as the person who left. Owners cannot change credentials on another owner's connection, so the new owner creates their own and selects them on each action or connection reference." }
  ],
  relatedTools: [],
  relatedPatterns: ["reassign-apps-flows-when-maker-leaves", "find-orphaned-apps-and-flows-powershell", "connection-references-for-solution-flows", "service-principal-application-user-deployments"],
  relatedLinks: [
    { href: "/errors/user-account-is-disabled-power-automate-connection", label: "Error: user account is disabled" },
    { href: "/errors/permission-denied-due-to-missing-connection-acl", label: "Error: missing connection ACL" },
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" }
  ],
  sources: [
    automateDoc("change-cloud-flow-owner", "Change the owner of a cloud flow"),
    automateDoc("create-team-flows", "Share a cloud flow"),
    learnDoc("troubleshoot/power-platform/power-automate/flow-management/manage-orphan-flow-when-owner-leaves-org", "Manage orphaned flows when the owner leaves the organization"),
    learnDoc("power-platform/admin/power-automate-licensing/faqs", "Power Automate licensing FAQ")
  ]
};
