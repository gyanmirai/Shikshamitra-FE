'use client';

import type { IChatParticipant } from 'src/types/chat';

import { CONFIG } from 'src/config-global';
import { today } from 'src/utils/format-time';
import { useState, useEffect, useCallback } from 'react';
import { EmptyContent } from 'src/components/empty-content';
// import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { useGetContacts, useGetConversation, useGetConversations } from 'src/actions/chat';

import { Layout } from '../layout';
import { ChatNav } from '../chat-nav';
import { ChatRoom } from '../chat-room';
import { ChatMessageList } from '../chat-message-list';
import { ChatMessageInput } from '../chat-message-input';
import { ChatHeaderDetail } from '../chat-header-detail';
import { ChatHeaderCompose } from '../chat-header-compose';
import { useCollapseNav } from '../hooks/use-collapse-nav';

// ----------------------------------------------------------------------

const user = {
  id: '8864c717-587d-472a-929a-8e5f298024da-0',
  role: 'admin',
  email: 'admin@example.com',
  address: '123 Main St, Anytown, USA',
  displayName: 'John Doe',
  name: 'John Doe',
  lastActivity: today(),
  photoURL: 'https://minimal-assets-api.vercel.app/assets/images/avatars/avatar_1.jpg',
  phoneNumber: '123-456-7890',
  status: 'online' as 'online' | 'offline' | 'alway' | 'busy',
};

export function ChatView() {
  const router = useRouter();

  const { contacts } = useGetContacts();

  const searchParams = useSearchParams();

  const selectedConversationId = searchParams.get('id') || '';

  const [recipients, setRecipients] = useState<IChatParticipant[]>([]);

  const { conversations, conversationsLoading } = useGetConversations();

  const { conversation, conversationError, conversationLoading } = useGetConversation(
    `${selectedConversationId}`
  );

  const roomNav = useCollapseNav();

  const conversationsNav = useCollapseNav();

  const participants: IChatParticipant[] = conversation
    ? conversation.participants.filter(
        (participant: IChatParticipant) => participant.id !== `${user?.id}`
      )
    : [];

  useEffect(() => {
    if (conversationError || !selectedConversationId) {
      // router.push(paths.dashboard.chat);
    }
  }, [conversationError, router, selectedConversationId]);

  const handleAddRecipients = useCallback((selected: IChatParticipant[]) => {
    setRecipients(selected);
  }, []);

  return (
    // <DashboardContent
    //   maxWidth={false}
    //   sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}
    // >
    //   <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
    //     Chat
    //   </Typography>

    <Layout
      sx={{
        minHeight: 0,
        flex: '1 1 0',
        borderRadius: 2,
        position: 'relative',
        bgcolor: 'background.paper',
        boxShadow: (theme) => theme.customShadows.card,
      }}
      slots={{
        header: selectedConversationId ? (
          <ChatHeaderDetail
            collapseNav={roomNav}
            participants={participants}
            loading={conversationLoading}
          />
        ) : (
          <ChatHeaderCompose contacts={contacts} onAddRecipients={handleAddRecipients} />
        ),
        nav: (
          <ChatNav
            contacts={contacts}
            conversations={conversations}
            loading={conversationsLoading}
            selectedConversationId={selectedConversationId}
            collapseNav={conversationsNav}
          />
        ),
        main: (
          <>
            {selectedConversationId ? (
              <ChatMessageList
                messages={conversation?.messages ?? []}
                participants={participants}
                loading={conversationLoading}
              />
            ) : (
              <EmptyContent
                imgUrl={`${CONFIG.site.basePath}/assets/icons/empty/ic-chat-active.svg`}
                title="Good morning!"
                description="Write something awesome..."
              />
            )}

            <ChatMessageInput
              recipients={recipients}
              onAddRecipients={handleAddRecipients}
              selectedConversationId={selectedConversationId}
              disabled={!recipients.length && !selectedConversationId}
            />
          </>
        ),
        details: selectedConversationId && (
          <ChatRoom
            collapseNav={roomNav}
            participants={participants}
            loading={conversationLoading}
            messages={conversation?.messages ?? []}
          />
        ),
      }}
    />
    // </DashboardContent>
  );
}
