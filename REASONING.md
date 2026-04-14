# Technical Reasoning & Decision Log
**Project**: System Design Visualizer | **Started**: April 15, 2026
**Objective**: Document architectural decisions, rationale, and trade-offs

---

## Phase 6: Node Intelligence System
**Date**: April 2026 | **Decision Maker**: Architecture Team

### Decision 1: 30+ Node Types vs. Generic Node
**Context**: Initial design used generic "component" nodes. Users unable to distinguish API servers from databases.

**Options Considered**:
1. **Generic Node** - Single type, user-labeled (rejected: no semantic validation)
2. **10 Core Types** - Essential services only (rejected: too limiting)
3. **30+ Specialized Types** - Comprehensive coverage (selected: ✅)
4. **Type Plugin System** - Dynamic types (rejected: premature complexity)

**Decision**: Implement 30+ specialized node types with strict connection rules

**Rationale**:
- Users immediately understand architecture intent
- Enable semantic validation (DB ↔ Frontend blocked)
- Provides foundation for future analytics
- Allows smart suggestions and warnings
- Improves export accuracy across all 6 formats

**Trade-offs**:
- ✅ Semantic intelligence - Worth complexity
- ✅ Better exports - Immediate ROI
- ❌ Type maintenance overhead - Mitigated by metadata system
- ❌ UI complexity - Mitigated by search/filtering

**Implementation**:
```typescript
// connection-rules.ts: 30+ types with typed connections
// node-metadata.ts: Centralized type information
// Each type maps to cloud resources (AWS RDS → Database node)
```

---

### Decision 2: Connection Rule Engine Architecture
**Context**: Need to validate which node types can connect to which.

**Options**:
1. **Hardcoded Matrix** - switch/case statements (rejected: unmaintainable)
2. **Configuration Matrix** - 30x30 connection table (rejected: error-prone)
3. **Rule Engine Object** - Declarative rules per type (selected: ✅)

**Decision**: Build rule-based connection validator with per-type allowed connections

**Rationale**:
- Self-documenting code
- Easy to audit and modify
- Supports comments explaining architectural constraints
- Scales to more node types without refactoring

**Code Structure**:
```typescript
const NODE_CONNECTIONS = {
  'api-gateway': {
    canConnectTo: ['backend-service', 'microservice'],
    canReceiveFrom: ['frontend'],
    description: 'API Gateway routes requests to services'
  }
}
```

**Key Rules Enforced**:
- API Gateway → Backend/Microservices ✅
- Database → Frontend ❌ (architectural violation)
- Message Queue → Backend Services ✅
- Load Balancer → Any Backend ✅

---

### Decision 3: API Info Panel Placement & Content
**Context**: Users need to understand what each node can do and connect to.

**Options**:
1. **Tooltip on Hover** - Space-limited, read-only (rejected: not enough space)
2. **Right Sidebar Panel** - Persistent, collapsible (selected: ✅)
3. **Modal Dialog** - Intrusive, interrupts workflow (rejected: UX)
4. **Inline in Node** - Too much visual clutter (rejected: readability)

**Decision**: Implement persistent right-sidebar APIInfoPanel

**Content Strategy**:
```
Panel Title: Node Name
Description: What this node does
Can Connect To: [Badge list] API Service, Backend, Microservice
Can Receive From: [Badge list] Frontend, API Gateway
Provides: [List] REST API, gRPC endpoints
Database: [List] Name, Type, Tables
```

**Benefits**:
- Always accessible without disrupting canvas
- Searchable by user
- Extensible for future metadata
- Collapsible to reclaim space

---

## Phase 7A: Multi-Format Export System
**Date**: April 2026 | **Owner**: Export Team

### Decision 4: Six Export Formats vs. Two
**Context**: Initial plan: JSON + YAML. But real users need infrastructure as code.

**Options**:
1. **JSON Only** - Lightweight (rejected: not actionable)
2. **JSON + YAML** - Basic (rejected: insufficient)
3. **Four Formats** - JSON, YAML, Terraform, PlantUML (considered: adequate)
4. **Six Formats** - Add CloudFormation + Mermaid + C4 (selected: ✅)

**Decision**: Implement six export formats covering documentation, IaC, and visualization

**Format Selection Rationale**:

| Format | Use Case | Target Audience | Render Time |
|--------|----------|-----------------|---|
| **YAML** | Data interchange | Developers, DevOps | < 100ms |
| **PlantUML** | Diagram generation | Architects, Docs | < 200ms |
| **Terraform** | Infrastructure automation | DevOps, SRE | < 300ms |
| **CloudFormation** | AWS deployment | AWS engineers | < 300ms |
| **Mermaid** | Inline documentation | Documentation teams | < 100ms |
| **C4** | Enterprise models | Enterprise architects | < 200ms |

**Trade-offs**:
- ✅ Multiple export paths - Users can choose best fit
- ❌ Code duplication - Mitigated by export-utils.ts
- ✅ Export options appeal - Better product market fit
- ✅ Different audiences - Broader adoption

**Architecture Decision**: Centralized exporter with format-specific implementations

```typescript
// exportArchitecture(format, nodes, edges) → ExportResult
// Each format: separate exporter file with own logic
// Shared utilities in export-utils.ts
// Format registry in index.ts
```

---

### Decision 5: Client-Side vs. Server-Side Export
**Context**: Should export processing happen in browser or backend?

**Options**:
1. **Backend Rendering** - Send to API, receive file (rejected: +latency, +cost)
2. **Client-Side Only** - All processing in browser (selected: ✅)
3. **Hybrid** - Client for small, backend for large (considered: too complex)

**Decision**: All export processing in client browser using worker threads

**Rationale**:
- ✅ Zero server load - scales infinitely
- ✅ Instant feedback - no API round-trip
- ✅ Better UX - no waiting for server
- ✅ Privacy - user data never leaves browser
- ❌ Limited by browser memory - acceptable for normal use

**Implementation**:
```typescript
// exportArchitecture() runs in main thread
// Large exports (>500 nodes) could use Web Workers
// Current: no external dependencies needed
```

---

### Decision 6: ExportDialog UI Layout
**Context**: How to present 6 export formats?

**Options**:
1. **Flat Radio Buttons** - Simple (rejected: cluttered with 6 options)
2. **Dropdown Select** - Compact (rejected: preview cut off)
3. **Tabbed Interface** - Clear organization (rejected: horizontal space)
4. **Left Sidebar Tabs** (selected: ✅)

**Decision**: Left sidebar vertical tabs + center preview + bottom actions

**Layout Benefits**:
- ✅ One format visible per tab
- ✅ Live preview of full content
- ✅ Copy + Download actions prominent
- ✅ Responsive: sidebar can collapse on mobile
- ✅ Scales to 10+ formats easily

**Visual Hierarchy**:
```
Header: Export Architecture | Project Name | Close button
┌─────────────────────────────────────────────────────┐
│ Format Tabs │ Format Info Banner                    │
│ ─────────────┼──────────────────────────────────────│
│ ▲ YAML       │ Live Preview Content (Textarea)      │
│ PlantUML     │ (scrollable, read-only, monospace)   │
│ Terraform    │                                      │
│ CloudForm.   │                                      │
│ Mermaid      │                                      │
│ C4           │                                      │
├─────────────────────────────────────────────────────┤
│ Close  |  Copy  |  Download                         │
└─────────────────────────────────────────────────────┘
```

---

## Phase 8: Validation Engine (Planned)
**Date**: April 2026 | **Planning Stage**

### Decision 7: Validation Strategy
**Context**: Need to catch architecture errors before deployment.

**Options**:
1. **Simple Type Checking** - Only node type validation (rejected: insufficient)
2. **Pattern Recognition** - Detect common anti-patterns (selected for core: ✅)
3. **Machine Learning** - Train on successful architectures (rejected: cold start)
4. **Full Formal Verification** - Theorem prover (rejected: overkill)

**Decision**: Pattern-based validation with extensible rule engine

**Planned Validation Rules**:
- Microservices: No direct DB access from frontend services
- High Availability: At least N+1 redundancy for critical paths
- Security: Encryption boundary enforcement
- Technology: No deprecated versions in architecture

---

### Decision 8: Validator Implementation Location
**Decision**: Client-side core validation + server-side policy enforcement

**Rationale**:
- ✅ Fast local feedback
- ✅ Server enforces org policies
- ✅ Scales across deployment targets
- ✅ Hybrid: best of both worlds

---

## Phase 9: Performance Optimization (Planned)
**Date**: April 2026 | **Research Phase**

### Decision 9: Rendering Backend
**Options**:
1. **Canvas (Current)** - Good for < 200 nodes
2. **WebGL Backend** - For 1000+ nodes
3. **SVG Only** - Accessible but slow
4. **Canvas + WebGL Hybrid** - Best of both

**Tentative Decision**: Canvas for default, WebGL as opt-in for large architectures

**Reasoning**:
- ✅ Canvas: familiar to developers, good library support
- ✅ WebGL: scales to 5000+ nodes
- ✅ Hybrid: serves 99% of users optimally

---

## Phase 10: Security (Planned)
**Date**: April 2026 | **Enterprise Planning**

### Decision 10: Authentication Standard
**Options**:
1. **JWT Only** - Simple, stateless
2. **Session Cookies** - Traditional
3. **OAuth 2.0** - Industry standard
4. **SAML 2.0** - Enterprise SSO

**Decision**: JWT + OAuth 2.0 with SAML 2.0 upgrade path

**Rationale**:
- ✅ JWT: internal service communication
- ✅ OAuth 2.0: user-facing standard
- ✅ SAML: for enterprise customers
- ✅ Migration path: can add without redesign

---

## Decision Framework Template
Use this for future decisions:

```markdown
### Decision N: [Decision Title]
**Date**: [When made] | **Impact**: [High/Medium/Low]

**Context**: 
- What's the business/technical problem?
- What's the current pain point?

**Options**:
1. **Option A** - Why considered (rejected/selected: reason)
2. **Option B** - Why considered (rejected/selected: reason)

**Decision**: [Selected option]

**Rationale**:
- Pro 1
- Pro 2
- Con 1 (but mitigated by X)

**Implementation**:
- Key files
- Key patterns

**Trade-offs**:
- What we gain
- What we sacrifice
```

---

## Lessons Learned

### What Worked Well
1. **Rule-Based Connection Validation** - Maintainable and scalable
2. **Centralized Export Utils** - DRY principle paying off
3. **Sidebar Persistent Panels** - Better than modals for continuous use
4. **Client-Side Export** - Instant UX wins

### What Needs Improvement
1. **Early Performance Profiling** - Should have measured canvas at 500 nodes earlier
2. **Plugin System Delay** - Too early rejected, now becoming need
3. **Mobile Responsiveness** - Desktop-first approach limiting mobile users
4. **Test Coverage** - Installation tests came late, slowed integration

### Future Decision Principles
1. **Measure First** - Profile before optimizing
2. **Extensibility Matters** - Plan for third-party integrations
3. **Mobile First** - Don't assume desktop-only
4. **Test Early** - Unit tests should precede integration
5. **User Feedback** - Validate decisions with actual users

---

## Cross-Cutting Concerns

### Technology Selection Rationale
- **React Flow**: Best canvas library for interactive diagrams (vs. Cytoscape, Vis.js)
- **Zustand**: Lightweight state management (vs. Redux bloat for simple needs)
- **TailwindCSS**: Utility-first reduces CSS maintenance (vs. CSS modules)
- **TypeScript**: Type safety critical for 30+ node types
- **Next.js**: SSR + API routes (vs. separate frontend/backend)

### Rejected Frameworks & Why
- **Redux**: Overkill for this state complexity
- **GraphQL**: REST API sufficient, extra complexity not worth ROI
- **Docker for Frontend**: Vercel deployment better suited
- **Microservices Frontend**: Monorepo cleaner for shared types

---

## Continuous Improvement Cycle
- **Monthly**: Review decisions made, lessons learned
- **Quarterly**: Tech debt assessment
- **Annually**: Architecture review with stakeholders
- **Always**: Document trade-offs before implementation

**Last Updated**: April 15, 2026 by Architecture Team
**Next Review**: May 15, 2026
