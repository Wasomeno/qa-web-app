import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, SlidingTabsList, TabsTrigger } from '@/components/ui/tabs';


import { SingleIssueTab } from './components/single-issue-tab';
import { IssueWithChildTab } from './components/issue-with-child-tab';

interface CreateIssuePageProps {
  portalContainer?: HTMLElement | null;
}

export const CreateIssuePage: React.FC<CreateIssuePageProps> = ({
  portalContainer,
}) => {
  return (
    <ScrollArea className="h-full">
      <div className="pb-32">
        <div className="flex-none space-y-5 px-4 md:px-8 pt-6 md:pt-10 pb-6 border-b border-gray-100/80 bg-white/80 backdrop-blur-xl z-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">Create Issue</h1>
            <p className="text-sm text-gray-500 mt-1">
              Report a new bug or quality issue
            </p>
          </div>
        </div>

        <div className="px-4 md:px-8 pt-6">
          <Tabs defaultValue="issue" className="w-full">
            <SlidingTabsList className="mb-6" variant="line-sliding">
              <TabsTrigger value="issue" variant="line-sliding">Issue</TabsTrigger>
              <TabsTrigger value="child" variant="line-sliding">Issue with Child</TabsTrigger>
              <TabsTrigger value="ac" variant="line-sliding" disabled>
                From Acceptance Criteria
              </TabsTrigger>
            </SlidingTabsList>

            <TabsContent value="issue" className="mt-0">
              <SingleIssueTab portalContainer={portalContainer} />
            </TabsContent>

            <TabsContent value="child" className="mt-0">
              <IssueWithChildTab portalContainer={portalContainer} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ScrollArea>
  );
};

export default CreateIssuePage;
