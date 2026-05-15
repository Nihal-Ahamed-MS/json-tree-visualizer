"use client";

import { useState } from "react";
import { SplitPane, Pane } from "react-split-pane";
import { XCircleIcon, CheckCircleIcon, SidebarIcon, HeartIcon, GithubLogoIcon } from "@phosphor-icons/react";
import Editor from "@monaco-editor/react";
import { getDataFromLocal, isValidJson } from "@/lib/helper";
import { LOCAL_STORAGE_KEY, SIDEBAR_STATE } from "@/lib/constants";
import { SplitDivider } from "./components/Splitter";

export default function Page() {

    const COLLAPSED_WIDTH = 48;
    const [validJson, setValidJson] = useState(true);
    const [jsonData, setJsonData] = useState<string>(() => getDataFromLocal(LOCAL_STORAGE_KEY.JSON_DATA) ?? "");
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => Boolean(getDataFromLocal(LOCAL_STORAGE_KEY.SIDEBAR)) ?? SIDEBAR_STATE.OPEN);
    const [sidebarSize, setSidebarSize] = useState<string | number>("20%");

    const handleEditorOnChange = (value: string) => {
        setValidJson(isValidJson(value) ?? true);
        setJsonData(value);

        localStorage.setItem(LOCAL_STORAGE_KEY.JSON_DATA, value);
    };

    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        localStorage.setItem(LOCAL_STORAGE_KEY.SIDEBAR, String(!isSidebarOpen));
    };

    return (
        <div className="h-screen w-screen overflow-hidden bg-[#0a0a0a] text-zinc-50">
            <SplitPane
                direction="horizontal"
                resizable={isSidebarOpen}
                onResizeEnd={(sizes) => setSidebarSize(sizes[0])}
                divider={isSidebarOpen ? SplitDivider : undefined}
            >
                <Pane
                    size={isSidebarOpen ? sidebarSize : COLLAPSED_WIDTH}
                    minSize={isSidebarOpen ? "15%" : COLLAPSED_WIDTH}
                    maxSize={isSidebarOpen ? "60%" : COLLAPSED_WIDTH}
                >
                    {isSidebarOpen ? (
                        <div className="flex h-full flex-col bg-[#111111]">
                            {/* top bar */}
                            <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
                                <button
                                    onClick={handleToggleSidebar}
                                    className="cursor-pointer rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                                    aria-label="Collapse editor"
                                >
                                    <SidebarIcon size={16} />
                                </button>
                                <span className="mt-auto mb-auto text-xs font-semibold text-zinc-600 select-none">
                                    JSON Tree
                                </span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <Editor
                                    height="100%"
                                    defaultLanguage="json"
                                    value={jsonData}
                                    onChange={(val) => handleEditorOnChange(val ?? "")}
                                    theme="vs-dark"
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        lineNumbers: "on",
                                        scrollBeyondLastLine: false,
                                        renderLineHighlight: "none",
                                        overviewRulerLanes: 0,
                                        padding: { top: 12 },
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center bg-[#111111] pt-2">
                            <button
                                onClick={handleToggleSidebar}
                                className="cursor-pointer rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                                aria-label="Expand editor"
                            >
                                <SidebarIcon size={16} />
                            </button>
                            <span className="mt-auto mb-auto -rotate-90 text-xs font-semibold text-nowrap text-zinc-600 select-none">
                                JSON Tree
                            </span>
                        </div>
                    )}
                </Pane>
                <Pane>
                    <div className="flex h-full flex-col bg-[#0a0a0a]">
                        {/* canvas area */}
                        <div className="flex flex-1 items-center justify-center">
                            <p className="text-xs font-medium uppercase tracking-widest text-zinc-600">
                                Canvas
                            </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-2 bg-zinc-800">
                            {jsonData ? (
                                validJson ? (
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                                        <CheckCircleIcon size={13} weight="fill" />
                                        Valid JSON
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-red-400">
                                        <XCircleIcon size={13} weight="fill" />
                                        Invalid JSON
                                    </span>
                                )
                            ) : (
                                <span />
                            )}
                            <div className="flex items-center text-xs gap-1 text-zinc-400">
                                <span className="flex items-center gap-1">
                                    Made with ❤️
                                </span>
                                <a
                                    href="https://github.com/Nihal-Ahamed-MS"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cursor-pointer flex items-center gap-1 transition-colors hover:text-zinc-300"
                                >
                                    GitHub
                                </a>
                            </div>
                        </div>
                    </div>
                </Pane>
            </SplitPane>
        </div>
    );
}
