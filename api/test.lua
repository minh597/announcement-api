local WindUI=loadstring(game:HttpGet("https://raw.githubusercontent.com/Footagesus/WindUI/main/dist/main.lua"))()
local Window=WindUI:CreateWindow({Title="Product Announcer",Icon="rbxassetid://102148548431207",Folder="ProductGUI",Size=UDim2.fromOffset(450,350),Theme="Dark"})
local TabMain=Window:Tab({Title="Main",Icon="rbxassetid://102148548431207"})
local TabLog=Window:Tab({Title="Log",Icon="rbxassetid://102148548431207"})

local HttpService=game:GetService("HttpService")
local Players=game:GetService("Players")
local LocalPlayer=Players.LocalPlayer
local API_URL="https://ann-six.vercel.app/api/announcement"
local autoCheck=true
local checkInterval=2
local lastGid=nil
local GIDLog={}

TabMain:Button({Title="Test Button",Callback=function()WindUI:Notify({Title="Test",Content="Button works",Duration=2})end})
TabMain:Slider({Title="Speed",Value={Min=1,Max=500,Default=50},Callback=function(v)end})
TabMain:Input({Title="Player Name",Placeholder="Enter name...",Callback=function(t)end})

TabLog:Button({Title="📋 View All Logs",Callback=function()if #GIDLog==0 then WindUI:Notify({Title="Log",Content="No announcements logged",Duration=2})else WindUI:Notify({Title="Announcement Log",Content="Total: "..#GIDLog.." announcements",Duration=3})end end})
TabLog:Button({Title="🗑️ Clear Log",Callback=function()GIDLog={} lastGid=nil WindUI:Notify({Title="Log Cleared",Content="All logs cleared",Duration=2})end})

local function addLog(a)table.insert(GIDLog,{id=a.id,title=a.title,content=a.content,priority=a.priority or "normal",time=os.date("%H:%M:%S"),timestamp=a.createdAt})if #GIDLog>50 then table.remove(GIDLog,1)end end
local function markAsRead(id)task.spawn(function()local u=tostring(LocalPlayer.UserId)pcall(function()game:HttpGetAsync(API_URL.."?markRead="..id.."&userId="..u)end)end)end

function checkAPI()
    local s,r=pcall(function()
        local url=API_URL.."?limit=10"
        if lastGid then url=url.."&since="..lastGid end
        local res=game:HttpGetAsync(url)
        local d=HttpService:JSONDecode(res)
        if d.success and d.data and #d.data>0 then
            local l=d.data[#d.data]
            if l.id~=lastGid then
                lastGid=l.id
                addLog(l)
                local dur=5 local pre="🔔"
                if l.priority=="urgent"then dur=10 pre="🚨"
                elseif l.priority=="high"then dur=7 pre="⚠️"
                elseif l.priority=="low"then dur=3 pre="ℹ️"end
                WindUI:Notify({Title=pre.." "..(l.title or "New Announcement"),Content=l.content or "No content",Duration=dur})
                task.delay(1,function()markAsRead(l.id)end)
            end
        end
    end)
    if not s then warn("API check failed:",r)end
end

task.spawn(function()
    task.wait(2)
    checkAPI()
    while true do
        task.wait(checkInterval)
        if autoCheck then checkAPI() end
    end
end)

WindUI:Notify({Title="Success",Content="GUI loaded successfully!",Duration=3})
