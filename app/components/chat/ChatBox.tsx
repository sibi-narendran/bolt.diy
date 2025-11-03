import React from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { classNames } from '~/utils/classNames';
import FilePreview from './FilePreview';
import { ScreenshotStateManager } from './ScreenshotStateManager';
import { SendButton } from './SendButton.client';
import { IconButton } from '~/components/ui/IconButton';
import { toast } from 'react-toastify';
import { SpeechRecognitionButton } from '~/components/chat/SpeechRecognition';
import { SupabaseConnection } from './SupabaseConnection';
import { ExpoQrModal } from '~/components/workbench/ExpoQrModal';
import type { ProviderInfo } from '~/types/model';
import { ColorSchemeDialog } from '~/components/ui/ColorSchemeDialog';
import type { DesignScheme } from '~/types/design-scheme';
import type { ElementInfo } from '~/components/workbench/Inspector';
import { McpTools } from './MCPTools';

interface ChatBoxProps {
  provider?: ProviderInfo;
  uploadedFiles: File[];
  imageDataList: string[];
  textareaRef: React.RefObject<HTMLTextAreaElement> | undefined;
  input: string;
  handlePaste: (e: React.ClipboardEvent) => void;
  TEXTAREA_MIN_HEIGHT: number;
  TEXTAREA_MAX_HEIGHT: number;
  isStreaming: boolean;
  handleSendMessage: (event: React.UIEvent, messageInput?: string) => void;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  chatStarted: boolean;
  exportChat?: () => void;
  qrModalOpen: boolean;
  setQrModalOpen: (open: boolean) => void;
  handleFileUpload: () => void;
  setUploadedFiles?: ((files: File[]) => void) | undefined;
  setImageDataList?: ((dataList: string[]) => void) | undefined;
  handleInputChange?: ((event: React.ChangeEvent<HTMLTextAreaElement>) => void) | undefined;
  handleStop?: (() => void) | undefined;
  enhancingPrompt?: boolean | undefined;
  enhancePrompt?: (() => void) | undefined;
  chatMode?: 'discuss' | 'build';
  setChatMode?: (mode: 'discuss' | 'build') => void;
  designScheme?: DesignScheme;
  setDesignScheme?: (scheme: DesignScheme) => void;
  selectedElement?: ElementInfo | null;
  setSelectedElement?: ((element: ElementInfo | null) => void) | undefined;
}

export const ChatBox: React.FC<ChatBoxProps> = (props) => {
  const {
    provider,
    uploadedFiles,
    setUploadedFiles,
    imageDataList,
    setImageDataList,
    textareaRef,
    input,
    handleInputChange,
    handlePaste,
    TEXTAREA_MIN_HEIGHT,
    TEXTAREA_MAX_HEIGHT,
    isStreaming,
    handleStop,
    handleSendMessage,
    enhancingPrompt,
    enhancePrompt,
    isListening,
    startListening,
    stopListening,
    chatStarted,
    qrModalOpen,
    setQrModalOpen,
    handleFileUpload,
    chatMode,
    setChatMode,
    designScheme,
    setDesignScheme,
    selectedElement,
    setSelectedElement,
  } = props;

  const showShortcutHint = input.length > 3;
  const showSendButton = input.length > 0 || isStreaming || uploadedFiles.length > 0;

  return (
    <div className="w-full max-w-chat mx-auto">
      <div className="relative flex flex-col gap-3 rounded-xl border border-appzap-elements-borderColor bg-appzap-elements-background-depth-2/95 backdrop-blur-xl p-3 sm:p-4 shadow-sm">
        <FilePreview
          files={uploadedFiles}
          imageDataList={imageDataList}
          onRemove={(index) => {
            setUploadedFiles?.(uploadedFiles.filter((_, i) => i !== index));
            setImageDataList?.(imageDataList.filter((_, i) => i !== index));
          }}
        />
        <ClientOnly>
          {() => (
            <ScreenshotStateManager
              setUploadedFiles={setUploadedFiles}
              setImageDataList={setImageDataList}
              uploadedFiles={uploadedFiles}
              imageDataList={imageDataList}
            />
          )}
        </ClientOnly>
        {selectedElement && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-appzap-elements-borderColor bg-appzap-elements-background-depth-1/70 px-3 py-2 text-xs font-medium text-appzap-elements-textPrimary">
            <div className="flex items-center gap-2 lowercase">
              <code className="rounded px-1.5 py-1 bg-accent-500 text-white">{selectedElement?.tagName}</code>
              selected for inspection
            </div>
            <button className="text-accent-500" onClick={() => setSelectedElement?.(null)}>
              Clear
            </button>
          </div>
        )}
        <div className="relative rounded-lg border border-appzap-elements-borderColor/80 bg-appzap-elements-background-depth-1/70 transition-theme focus-within:border-appzap-elements-borderColorActive">
          <textarea
            ref={textareaRef}
            className="w-full resize-none bg-transparent px-3 sm:px-4 pt-3 sm:pt-4 pb-10 sm:pb-12 text-sm sm:text-base text-appzap-elements-textPrimary placeholder:text-appzap-elements-textTertiary outline-none transition-all duration-200"
            onDragEnter={(event) => {
              event.preventDefault();
              event.currentTarget.style.border = '2px solid #1488fc';
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.currentTarget.style.border = '2px solid #1488fc';
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              event.currentTarget.style.border = '1px solid var(--appzap-elements-borderColor)';
            }}
            onDrop={(event) => {
              event.preventDefault();
              event.currentTarget.style.border = '1px solid var(--appzap-elements-borderColor)';

              const files = Array.from(event.dataTransfer.files);
              files.forEach((file) => {
                if (file.type.startsWith('image/')) {
                  const reader = new FileReader();

                  reader.onload = (fileEvent) => {
                    const base64Image = fileEvent.target?.result as string;
                    setUploadedFiles?.([...uploadedFiles, file]);
                    setImageDataList?.([...imageDataList, base64Image]);
                  };
                  reader.readAsDataURL(file);
                }
              });
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                if (event.shiftKey) {
                  return;
                }

                event.preventDefault();

                if (isStreaming) {
                  handleStop?.();
                  return;
                }

                if (event.nativeEvent.isComposing) {
                  return;
                }

                handleSendMessage?.(event);
              }
            }}
            value={input}
            onChange={(event) => {
              handleInputChange?.(event);
            }}
            onPaste={handlePaste}
            style={{
              minHeight: TEXTAREA_MIN_HEIGHT,
              maxHeight: TEXTAREA_MAX_HEIGHT,
            }}
            placeholder={chatMode === 'build' ? 'How can Appzap help you today?' : 'What would you like to discuss?'}
            translate="no"
          />
          <ClientOnly>
            {() => (
              <SendButton
                show={showSendButton}
                isStreaming={isStreaming}
                disabled={!provider}
                onClick={(event) => {
                  if (isStreaming) {
                    handleStop?.();
                    return;
                  }

                  if (input.length > 0 || uploadedFiles.length > 0) {
                    handleSendMessage?.(event);
                  }
                }}
              />
            )}
          </ClientOnly>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <ColorSchemeDialog designScheme={designScheme} setDesignScheme={setDesignScheme} />
          <McpTools />
          <IconButton title="Upload file" className="transition-theme" onClick={() => handleFileUpload()}>
            <div className="i-ph:paperclip text-xl" />
          </IconButton>
          <IconButton
            title="Enhance prompt"
            disabled={input.length === 0 || enhancingPrompt}
            className={classNames('transition-theme', enhancingPrompt ? 'opacity-100' : '')}
            onClick={() => {
              enhancePrompt?.();
              toast.success('Prompt enhanced!');
            }}
          >
            {enhancingPrompt ? (
              <div className="i-svg-spinners:90-ring-with-bg text-appzap-elements-loader-progress text-xl animate-spin" />
            ) : (
              <div className="i-appzap:stars text-xl" />
            )}
          </IconButton>
          <SpeechRecognitionButton
            isListening={isListening}
            onStart={startListening}
            onStop={stopListening}
            disabled={isStreaming}
          />
          {chatStarted && (
            <IconButton
              title={chatMode === 'discuss' ? 'Switch to build mode' : 'Switch to discuss mode'}
              className={classNames(
                'transition-theme flex items-center gap-1 px-1.5',
                chatMode === 'discuss'
                  ? '!bg-appzap-elements-item-backgroundAccent !text-appzap-elements-item-contentAccent'
                  : 'bg-appzap-elements-item-backgroundDefault text-appzap-elements-item-contentDefault',
              )}
              onClick={() => {
                setChatMode?.(chatMode === 'discuss' ? 'build' : 'discuss');
              }}
            >
              <div className="i-ph:chats text-xl" />
              <span className="hidden sm:inline">Discuss</span>
            </IconButton>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          {showShortcutHint ? (
            <div className="text-appzap-elements-textTertiary">
              Use <kbd className="kdb px-1.5 py-0.5">Shift</kbd> + <kbd className="kdb px-1.5 py-0.5">Return</kbd> for a
              new line
            </div>
          ) : (
            <span className="text-transparent select-none">spacing</span>
          )}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <SupabaseConnection />
          </div>
        </div>
      </div>
      <ExpoQrModal open={qrModalOpen} onClose={() => setQrModalOpen(false)} />
    </div>
  );
};
