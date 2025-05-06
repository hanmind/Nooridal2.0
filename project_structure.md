# Project Structure (Nooridal2.0)

```
.
├── .gitignore
├── .roo/
│   └── rules/
│       ├── dev_workflow.md
│       ├── roo_rules.md
│       ├── self_improve.md
│       └── taskmaster.md
├── .env.example
├── jest.config.js
├── nooridal/
│   ├── .env
│   ├── .env.local
│   ├── .gitignore
│   ├── README.md
│   ├── cypress.config.ts
│   ├── cypress/
│   │   ├── e2e/
│   │   │   ├── 1-getting-started/
│   │   │   │   └── todo.cy.js
│   │   │   └── 2-advanced-examples/
│   │   │       ├── actions.cy.js
│   │   │       ├── aliasing.cy.js
│   │   │       ├── assertions.cy.js
│   │   │       ├── connectors.cy.js
│   │   │       ├── cookies.cy.js
│   │   │       ├── cypress_api.cy.js
│   │   │       ├── files.cy.js
│   │   │       ├── location.cy.js
│   │   │       ├── misc.cy.js
│   │   │       ├── navigation.cy.js
│   │   │       ├── network_requests.cy.js
│   │   │       ├── querying.cy.js
│   │   │       ├── spies_stubs_clocks.cy.js
│   │   │       ├── storage.cy.js
│   │   │       ├── traversal.cy.js
│   │   │       ├── utilities.cy.js
│   │   │       ├── viewport.cy.js
│   │   │       ├── waiting.cy.js
│   │   │       └── window.cy.js
│   │   └── support/
│   │       ├── commands.ts
│   │       └── e2e.ts
│   ├── jest.config.js
│   ├── jest.setup.js
│   ├── next-env.d.ts
│   ├── next.config.js
│   ├── package.json
│   ├── project_structure.txt # This was created by the previous command, will be overwritten by the markdown file
│   ├── src/
│   │   ├── app/
│   │   │   ├── agent/
│   │   │   │   └── page.tsx
│   │   │   ├── api/
│   │   │   │   └── chat/
│   │   │   │       ├── __tests__/
│   │   │   │       │   └── route.test.ts
│   │   │   │       └── route.ts
│   │   │   ├── calendar/
│   │   │   │   ├── Calendar.tsx
│   │   │   │   ├── DatePopup.tsx
│   │   │   │   ├── DiaryPopup.tsx
│   │   │   │   ├── SchedulePopup.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── chat/
│   │   │   │   └── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── __tests__/
│   │   │   │   │   ├── AIMessage.test.tsx
│   │   │   │   │   ├── ChatContainer.test.tsx
│   │   │   │   │   ├── ChatInput.test.tsx
│   │   │   │   │   ├── ChatSidebar.test.tsx
│   │   │   │   │   ├── ErrorMessage.test.tsx
│   │   │   │   │   └── UserMessage.test.tsx
│   │   │   │   ├── AIMessage.tsx
│   │   │   │   ├── ChatContainer.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   ├── ChatSidebar.tsx
│   │   │   │   ├── ErrorMessage.tsx
│   │   │   │   ├── TabBar.tsx
│   │   │   │   └── UserMessage.tsx
│   │   │   ├── context/
│   │   │   │   ├── AddressContext.tsx
│   │   │   │   ├── PregnancyInfoContext.js
│   │   │   │   └── ProfileContext.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── lib/
│   │   │   │   ├── __tests__/
│   │   │   │   │   ├── chatRoomService.test.ts
│   │   │   │   │   └── difyService.test.ts
│   │   │   │   ├── chatRoomService.ts
│   │   │   │   ├── difyService.ts
│   │   │   │   └── supabase.ts
│   │   │   ├── location/
│   │   │   │   ├── facilities/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── hospital/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── transport/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── welfare/
│   │   │   │       └── page.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── mypage/
│   │   │   │   ├── app-info/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── faq/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── pregnancy-info/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── profile/
│   │   │   │       └── page.tsx
│   │   │   ├── page.tsx
│   │   │   └── register/
│   │   │       ├── guardian/
│   │   │       │   ├── invitation/
│   │   │       │   │   └── page.tsx
│   │   │       │   └── page.tsx
│   │   │       ├── page.tsx
│   │   │       └── pregnant/
│   │   │           ├── page.tsx
│   │   │           └── pregnancy-info/
│   │   │               ├── baby-name/
│   │   │               │   └── page.tsx
│   │   │               ├── complete/
│   │   │               │   └── page.tsx
│   │   │               ├── expected-date/
│   │   │               │   └── page.tsx
│   │   │               ├── high-risk/
│   │   │               │   └── page.tsx
│   │   │               └── page.tsx
│   │   ├── components/ # Older components?
│   │   │   └── pregnancy/
│   │   │       └── PregnancyFormLayout.tsx
│   │   ├── types/ # Centralized types
│   │   │   ├── chat.ts
│   │   │   └── db.ts
│   │   └── utils/
│   │       └── supabase.ts # Older Supabase client?
│   ├── supabase/
│   │   └── .gitignore
│   └── tsconfig.json
├── package.json
├── scripts/
│   ├── example_prd.txt
│   └── prd.txt
├── tasks/
│   ├── task_001.txt
│   ├── task_002.txt
│   ├── task_003.txt
│   ├── task_004.txt
│   ├── task_005.txt
│   ├── task_006.txt
│   ├── task_007.txt
│   ├── task_008.txt
│   ├── task_009.txt
│   ├── task_010.txt
│   ├── task_011.txt
│   ├── task_012.txt
│   ├── task_013.txt
│   ├── task_014.txt
│   └── task_015.txt
└── types_db.ts # Original Supabase generated types
```
