#!/bin/bash
cd /Users/kevinananda/Codes/qa-webapp
sed -i '' 's/prev: any =>/(prev: any) =>/g' src/pages/test-scenarios/components/scenario-detail.tsx
sed -i '' 's/p: any =>/(p: any) =>/g' src/pages/test-scenarios/components/scenario-detail.tsx
