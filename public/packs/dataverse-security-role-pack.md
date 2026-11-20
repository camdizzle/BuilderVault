# Dataverse Security Role Pack

From BuilderVault (buildervault.camwow.tv). Free to use and share inside your team.

Use this pack when you design security roles for a Dataverse app, or when a user reports that they cannot see or save something. Plan table and column names with the free Dataverse Table Naming Helper: https://buildervault.camwow.tv/tools/dataverse-table-naming-helper

---

## 1. Quick reference

Privileges: Create, Read, Write, Delete, Append, Append To, Assign, Share.

| Access level | Reaches |
| --- | --- |
| None | Nothing |
| User | Rows the user owns, rows shared with them, rows owned by their teams |
| Business Unit | Rows owned by anyone in the user's business unit |
| Parent: Child Business Units | The user's business unit and all beneath it |
| Organization | Every row |

Organization-owned tables have only None or Organization.

A user's access is the most generous combination of all their roles, including roles from teams. There is no deny.

---

## 2. Persona worksheet

Fill in one block per kind of user before building any role.

```
Persona:
Who they are:
How many:
What they do in the app:
Rows they must see:        own / team / business unit / all
Rows they must change:     own / team / business unit / all
May they delete?           no / own / wider
May they reassign?         no / yes
Sensitive columns they must not see:
Entra security group:
```

---

## 3. Role matrix template

One table per role. Levels: N none, U user, B business unit, P parent and child, O organization.

Role: ______________________

| Table | Create | Read | Write | Delete | Append | Append To | Assign | Share |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Service Request | | | | | | | | |
| Category | | | | | | | | |
| Note | | | | | | | | |
| Account | | | | | | | | |

### Worked example

Role: Request - Requester

| Table | Create | Read | Write | Delete | Append | Append To | Assign | Share |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Service Request | U | U | U | N | U | U | N | N |
| Category | N | O | N | N | N | O | N | N |
| Note | U | U | U | N | U | N | N | N |
| Account | N | O | N | N | N | O | N | N |

Role: Request - Agent

| Table | Create | Read | Write | Delete | Append | Append To | Assign | Share |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Service Request | B | B | B | N | B | B | B | U |
| Category | N | O | N | N | N | O | N | N |
| Note | B | B | U | N | B | N | N | N |
| Account | N | O | N | N | N | O | N | N |

Assign each custom role together with Basic User or App Opener.

---

## 4. What each task needs

| Task | Privileges |
| --- | --- |
| See a row | Read |
| Create a row | Create, and Read to see it afterwards |
| Set a lookup | Append on the row being saved, Append To on the row it points at |
| Add a note | Create and Append on Note, Append To on the parent table |
| Change the owner | Assign |
| Share a row | Share |
| Open a model-driven app | A role that includes the app, and Read on its tables |

---

## 5. Team set-up

1. Create an Entra security group per persona, for example `App - Request Agents`.
2. In the Power Platform admin centre, open the environment, then Settings, Users + permissions, Teams.
3. Create a team of type Microsoft Entra ID Security Group and pick the group.
4. Assign the security role to the team.
5. In the role, set Member's privilege inheritance to Direct User (Basic) access level and Team privileges.
6. Share the app with the same group.

---

## 6. Test checklist

Use an account that holds only the role under test and Basic User.

- [ ] The app opens without a privilege error.
- [ ] A new row can be created with every lookup set.
- [ ] Own rows are visible.
- [ ] Other users' rows are visible or hidden as designed.
- [ ] Own row can be edited and saved.
- [ ] Another user's row can or cannot be edited as designed.
- [ ] Delete, assign and share behave as designed.
- [ ] Notes and attachments can be added.
- [ ] Flows the user triggers succeed.
- [ ] Secured columns are blank for users outside the column security profile.
- [ ] The role is in the solution and deploys with it.

---

## 7. Troubleshooting table

| Symptom or message | Cause | Fix |
| --- | --- | --- |
| App opens, lists are empty | Read at User level and the user owns no rows, or no Read at all | Raise the Read level or share rows |
| Missing prvRead on a table | No Read privilege | Add Read at the needed level |
| Missing prvAppendTo on a table | Setting a lookup to that table | Add Append To on the target table |
| Missing prvAppend | Saving a row that holds a lookup | Add Append on the table being saved |
| User has no security role | No role directly or through a team | Add to the group, or assign a role |
| User not in the environment | Not in the environment's security group, or not synced | Add to the group and wait, or add the user |
| User sees too much | Another role grants wider access | List all roles including team roles and reduce |
| Column shows as blank | Column security | Add the user or team to the profile |

---

## 8. Good practice

- Create custom roles for your own tables. Do not edit the standard roles.
- Do not give System Administrator or System Customizer to app users.
- Assign roles to teams linked to Entra groups, not to individuals.
- Keep roles in the solution. Do not edit them in Production.
- Review role membership when people change jobs.

---

More patterns, tools and examples: https://buildervault.camwow.tv
