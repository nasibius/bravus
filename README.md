<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# BrHive Operations

**BrHive** is a gamified workforce management application designed specifically for supermarket and retail teams. It streamlines store operations by turning daily shifts into an engaging, point-based system where employees automatically receive tasks assigned by their managers, track their performance, and access operational guidelines seamlessly.

## 🌟 Top 4 Main Features

1. **Gamified Task Delegation:** Employees view a personalized dashboard of tasks assigned to them by their managers, including urgent and completed tasks. Successfully completing their assigned duties rewards them with points based on priority and time limits, encouraging proactive engagement and a sense of progression.
2. **AI-Powered Task Generation:** Store managers can use a smart AI input to instantly create tasks. The AI automatically categorizes the task, assigns appropriate point values, sets time limits, and determines if it needs photo verification based on a simple text prompt.
3. **In-App Document & Guideline Viewer:** Tasks can include attached files, such as promotional sign policies or display guidelines. Employees can open these documents directly within the app to ensure they follow exact company protocols without switching contexts.
4. **Quality Assurance via Photo Proof:** Certain tasks (like resetting a shelf or updating sale signs) explicitly require photo verification upon completion. This built-in accountability ensures that the work complies with visual merchandising and operational standards.

---

## 🗺️ Product Roadmap

1. **Phase 1: Foundation & Core Workflows**
   - Deploy task dashboard and personalized manager assignments.
   - Implement basic gamification (points for tasks).
   - Launch in-app document viewer for operational guidelines.
2. **Phase 2: AI Automation & Smart Delegation**
   - Rollout AI-powered task generation for store managers.
   - Dynamic point allocation based on task complexity and time limits.
   - Smart urgency routing to alert available staff of high-priority tasks.
3. **Phase 3: Verification & Quality Assurance**
   - Implement camera-based photo verification workflows directly in-app.
   - Create a manager review and approval loop for completed work.
   - Generate audit trails for store compliance.
4. **Phase 4: Advanced Gamification & Social Features**
   - Introduce leaderboards, badges, and monthly store-wide competitions.
   - Activity calendars and historical performance tracking for employees.
   - Reward redemption system allowing employees to trade points for perks.
5. **Phase 5: Enterprise Integration & Analytics**
   - Integrate with existing HR, scheduling, and POS/inventory management systems.
   - Build managerial analytics dashboards to monitor workforce efficiency.
   - Leverage AI for predictive staffing and task forecasting based on store traffic data.

---

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
