local QBCore = exports['qb-core']:GetCoreObject()
local isDisplaying = false
local currentIndex = 1

RegisterNUICallback('getConfig', function(data, cb)
    cb({
        style = Config.Style
    })
end)

local function ShowInfoBar()
    Citizen.CreateThread(function()
        while true do
            if not isDisplaying and Config.Messages and #Config.Messages > 0 then
                isDisplaying = true

                if currentIndex > #Config.Messages then
                    currentIndex = 1
                end

                local message = Config.Messages[currentIndex]
                SendNUIMessage({
                    type = 'showMessage',
                    text = message.text,
                    scrollSpeed = message.scrollSpeed or 180
                })

                Citizen.Wait(message.pause or 2000)
                currentIndex = currentIndex + 1
                isDisplaying = false
            end
            Citizen.Wait(50)
        end
    end)
end

RegisterNUICallback('scrollComplete', function(data, cb)
    isDisplaying = false
    cb('ok')
end)

RegisterNUICallback('enableNUI', function(data, cb)
    SetNuiFocus(true, true)
    cb('ok')
end)

RegisterCommand('infob', function(_, _, _)
    SetNuiFocus(true, true)
    SendNUIMessage({
        type = 'toggleMove',
        state = true
    })
end, false)

Citizen.CreateThread(function()
    ShowInfoBar()
end)

RegisterNUICallback('disableNUI', function(data, cb)
    SetNuiFocus(false, false)
    cb('ok')
end)

RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    Wait(10000)
    ShowInfoBar()
end)

RegisterNetEvent('QBCore:Client:OnPlayerUnload', function()
    LocalPlayer.state:set('isLoggedIn', false, false)
    isDisplaying = false
end)

AddEventHandler('onResourceStart', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    if LocalPlayer.state['isLoggedIn'] then
        ShowInfoBar()
    end
end)

AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    isDisplaying = false
end)
