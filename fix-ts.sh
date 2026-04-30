#!/bin/bash
cd /Users/kevinananda/Codes/qa-webapp

sed -i '' 's/prev =>/prev: any =>/g' src/pages/test-scenarios/components/scenario-detail.tsx
sed -i '' 's/p =>/p: any =>/g' src/pages/test-scenarios/components/scenario-detail.tsx

sed -i '' 's/initialScenario.sections/initialScenario.sections!/g' src/pages/test-scenarios/components/scenario-detail.tsx
sed -i '' 's/scenario.sections/scenario.sections!/g' src/pages/test-scenarios/components/scenario-detail.tsx
sed -i '' 's/prev.sections/prev.sections!/g' src/pages/test-scenarios/components/scenario-detail.tsx

sed -i '' 's/scenario.createdBy/scenario.creatorId?.toString()/g' src/pages/test-scenarios/components/scenario-detail.tsx

