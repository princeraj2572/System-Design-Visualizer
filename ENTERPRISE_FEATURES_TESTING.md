# Enterprise Features - Testing Guide

## Quick Start Testing

### Prerequisites
- ✅ Backend running (Node.js processes verified)
- ✅ Frontend running on port 3000
- ✅ Logged in with valid authentication token
- ✅ Project opened in editor

## Feature Testing Checklist

### 1. Template Library (📚 Templates Button)
**Expected Location**: Editor toolbar, 3rd from right
**Test Steps**:
1. Click "Templates" button (📚 icon)
2. Verify dialog opens with 3 template cards:
   - Microservices (popularity: 95%)
   - Serverless (popularity: 88%)
   - Monolith (popularity: 72%)
3. Test search box:
   - Type "micro" → should show Microservices
   - Type "server" → should show Serverless
   - Clear search → shows all 3
4. Test grid/list view toggle:
   - Grid view → 3-column layout with cards
   - List view → detailed rows with metadata
5. Test "Use This Template" button:
   - Click on Microservices
   - Canvas should populate with template nodes
   - Verify connections created
6. Verify responsive design:
   - On mobile width (375px) → single column
   - On desktop (1920px) → full layout

**Expected Results**:
- ✅ Dialog appears/disappears correctly
- ✅ Search filters work in real-time
- ✅ View mode toggle switches layouts
- ✅ Template application adds nodes to canvas
- ✅ Mobile responsive adapts

### 2. Audit Log (📄 Audit Log Button)
**Expected Location**: Editor toolbar, 2nd from right
**Test Steps**:
1. Click "Audit Log" button (📄 icon)
2. Verify dialog shows mock audit entries:
   - CREATE: New microservice created
   - UPDATE: Lambda function properties changed
   - DELETE: Old database component removed
   - MOVE: API Gateway repositioned
   - CONNECT: Service connection established
   - EXPORT: Project exported to Terraform
   - IMPORT: Node template imported
3. Test filter functionality:
   - Action filter: Select "UPDATE" → show only UPDATE entries
   - User filter: Select "alex" → show only alex's changes
   - Resource filter: Select "Service" → show only service changes
4. Test multi-filter:
   - Action: UPDATE + Resource: Service → should combine filters
5. Test CSV export:
   - Click "Export as CSV" button
   - Verify file downloads
   - Open in Excel/text editor
   - Verify all columns present: Timestamp, Action, User, Resource, Changes

**Expected Results**:
- ✅ All mock entries display correctly
- ✅ Filters work independently and combined
- ✅ CSV export generates valid file
- ✅ Timestamps display properly

### 3. Compliance Reporter (🛡️ Compliance Button)
**Expected Location**: Editor toolbar, right-most button
**Test Steps**:
1. Click "Compliance" button (🛡️ icon)
2. Verify main framework selector shows 5 options:
   - SOC 2 Type II (active by default)
   - ISO/IEC 27001
   - HIPAA
   - PCI DSS
   - GDPR
3. Test SOC 2 framework:
   - Verify score card shows: 87% compliance
   - Color should be yellow (75-90%)
   - Status should show: "Mostly Compliant"
4. Test compliance checks:
   - Verify 5-6 checks listed with status icons
   - ✅ Pass (green), ❌ Fail (red), ⚠️ Warning (yellow), ⊗ Skipped (gray)
   - Click on expandable checks
   - Show remediation guidance
5. Test framework switching:
   - Click on ISO/IEC 27001
   - Score changes to 92%
   - Color changes to green (≥90%)
   - Status changes to "Compliant"
   - Checks update for new framework
6. Test export:
   - Click "Export Report"
   - Verify text/PDF format option
   - Verify download

**Expected Results**:
- ✅ All 5 frameworks load correctly
- ✅ Score colors change based on percentage
- ✅ Status text matches score
- ✅ Remediation guidance displays
- ✅ Framework switching updates all content
- ✅ Export generates valid file

### 4. Enhanced Presence Indicator (Real-time collaboration section)
**Test Steps**:
1. Locate presence indicator (typically top-right of canvas)
2. Should show list of active users
3. Verify user status colors and indicators
4. Observe status changes (Editing → Active → Idle)
5. Verify selected node display per user

**Expected Results**:
- ✅ User list displays with activity status
- ✅ Status updates in real-time
- ✅ Connection status indicator visible

### 5. Collaborative Comments
**Test Steps**:
1. Right-click or context menu on a canvas node
2. Look for "Add Comment" option
3. Verify comment thread opens
4. Add test comment with text
5. Verify comment appears with:
   - Author name/avatar
   - Timestamp
   - Like button
6. Test thread resolution:
   - Click "Resolve" button
   - Comment should move to "Resolved" tab

**Expected Results**:
- ✅ Comment interface accessible
- ✅ Comments save with timestamps
- ✅ Like/unlike functionality works
- ✅ Thread resolution toggles properly

### 6. Notification Center
**Test Steps**:
1. Locate notification bell icon (top area)
2. Verify unread count badge (red circle)
3. Click bell icon
4. Verify notification dropdown shows:
   - All/Unread tabs
   - Sample notifications with different types:
     - ℹ️ Info (blue)
     - ✅ Success (green)
     - ⚠️ Warning (yellow)
     - ❌ Error (red)
5. Test filtering:
   - Click "Unread" tab → shows unread only
   - Click notification → marks as read
   - Unread count decreases
6. Test clear:
   - Click "Clear All" → all notifications removed

**Expected Results**:
- ✅ Notification bell accessible
- ✅ Unread badge accurate
- ✅ Notification types display correctly
- ✅ Mark as read works
- ✅ Clear all clears notifications

## Advanced Testing

### Browser DevTools Checks
1. **Console**:
   - No TypeScript errors
   - No missing import warnings
   - No network failures

2. **Network**:
   - Template loading instant (local data)
   - Audit log retrieval successful
   - No 404s or 500s

3. **Performance**:
   - Template Library opens in <100ms
   - Audit Log renders in <200ms
   - Compliance Reporter switches frameworks <150ms

4. **Accessibility**:
   - Tab navigation works through all inputs
   - Screen reader can identify button purposes
   - Color contrast meets WCAG AA

### Cross-Browser Testing
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Device Testing
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x812)

## Known Limitations (Mock Data)

⚠️ These features currently use mock data:

| Feature | Current State | Planned | Timeline |
|---------|---------------|---------|----------|
| Templates | 3 built-in | User templates saved to DB | Phase 10 |
| Audit Log | 7 mock entries | Real backend tracking | Phase 10 |
| Compliance | Mock scoring | Real analysis engine | Phase 11 |
| Presence | Single user mock | WebSocket real-time | Phase 10 |
| Comments | Thread UI only | Backend persistence | Phase 10 |
| Notifications | 4 sample items | WebSocket real-time | Phase 10 |

## Integration Tasks (For Phase 10+)

1. **Template Service**
   - Replace mock with database queries
   - Add user template persistence
   - Implement search on backend
   - Add popularity tracking

2. **Audit Log Service**
   - Hook all canvas actions to logging
   - Store in audit table in PostgreSQL
   - Real-time log retrieval

3. **Compliance Integration**
   - Placeholder for external compliance engine
   - API integration point defined
   - Multi-framework analysis

4. **Real-time Features**
   - Socket.io integration for presence
   - Live comment sync
   - Push notifications

## Performance Baseline

Expected metrics on standard hardware:

- Template Library open: <100ms
- Audit Log filter: <200ms
- Compliance switch: <150ms
- Comment post: <300ms
- Notification dismiss: <50ms

## Success Criteria

✅ **All Features Working**:
- 6/6 components render without errors
- 0 TypeScript compile errors
- 0 console warnings
- All buttons functional
- All modals open/close correctly
- All filters work
- All exports generate files

✅ **User Experience**:
- Responsive on all breakpoints
- Accessible via keyboard
- Clear visual feedback
- Proper loading states
- Error messages helpful

✅ **Code Quality**:
- No dead code
- Proper type safety
- Clean architecture
- Well-documented
- Ready for backend integration

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Modal won't open | Check browser console for errors, reload page |
| Filter not working | Verify React state updates, check DevTools |
| Export fails | Check browser download permissions |
| Slow performance | Clear browser cache, check DevTools Performance tab |
| Mobile layout broken | Verify viewport meta tag, test at exact breakpoints |

---

**Test Date**: [Your testing date]
**Tester**: [Your name]
**Status**: ⏳ Ready for testing
**Overall Result**: ⏸️ Pending
